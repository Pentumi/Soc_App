import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function manualMigration() {
  try {
    console.log('🚀 Starting manual migration from Society to Club architecture...\n');

    // Check current state
    const userCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`;
    console.log('Current users:', userCount);

    const tournamentCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM tournaments`;
    console.log('Current tournaments:', tournamentCount);

    // Check if societies table exists
    let societies: any[];
    try {
      societies = await prisma.$queryRaw`SELECT * FROM societies`;
      console.log(`\n✅ Found ${societies.length} society/societies to migrate\n`);
    } catch (e) {
      console.log('\n❌ No societies table found. Migration may have already run.');
      console.log('Checking for clubs table...\n');

      const clubs = await prisma.club.findMany();
      console.log(`Found ${clubs.length} clubs`);

      if (clubs.length > 0) {
        console.log('✅ Migration already complete!');
        await prisma.$disconnect();
        return;
      }

      throw new Error('No societies or clubs found. Database state unclear.');
    }

    // Run migration in transaction
    await prisma.$transaction(async (tx) => {
      console.log('Step 1: Migrating societies to clubs...');

      for (const society of societies) {
        // Find first admin or any user as owner
        const owner = await tx.$queryRaw<any[]>`
          SELECT id FROM users
          WHERE society_id = ${society.id} AND role = 'admin'
          ORDER BY created_at LIMIT 1
        `;

        const ownerId = owner[0]?.id || (await tx.$queryRaw<any[]>`
          SELECT id FROM users WHERE society_id = ${society.id} ORDER BY created_at LIMIT 1
        `)[0]?.id;

        if (!ownerId) {
          throw new Error(`No users found for society ${society.id}`);
        }

        // Create club
        await tx.$executeRaw`
          INSERT INTO clubs (name, invite_code, owner_id, default_format, created_at, updated_at)
          VALUES (
            ${society.name},
            ${uuidv4()},
            ${ownerId},
            ${society.default_format || 'Stroke Play'},
            ${society.created_at},
            ${society.updated_at}
          )
        `;

        console.log(`  ✓ Created club: ${society.name}`);
      }

      console.log('\nStep 2: Migrating user roles to club_members...');

      const users = await tx.$queryRaw<any[]>`
        SELECT id, society_id, role, created_at FROM users WHERE society_id IS NOT NULL
      `;

      let ownerCount = 0;
      let adminCount = 0;
      let playerCount = 0;

      for (const user of users) {
        // Get club id (same as society_id since we preserved IDs)
        const clubId = user.society_id;

        // Determine role: first admin becomes owner, rest become admin or player
        let mappedRole = 'player';
        if (user.role === 'admin') {
          // Check if this club already has an owner
          const existingOwner = await tx.$queryRaw<any[]>`
            SELECT id FROM club_members WHERE club_id = ${clubId} AND role = 'owner'
          `;

          if (existingOwner.length === 0) {
            mappedRole = 'owner';
            ownerCount++;
          } else {
            mappedRole = 'admin';
            adminCount++;
          }
        } else {
          playerCount++;
        }

        await tx.$executeRaw`
          INSERT INTO club_members (club_id, user_id, role, joined_at)
          VALUES (${clubId}, ${user.id}, ${mappedRole}, ${user.created_at})
        `;
      }

      console.log(`  ✓ Created ${ownerCount} owners, ${adminCount} admins, ${playerCount} players`);

      console.log('\nStep 3: Creating tournament participants...');

      const scores = await tx.$queryRaw<any[]>`
        SELECT DISTINCT tournament_id, user_id, created_at
        FROM tournament_scores
        ORDER BY tournament_id, created_at
      `;

      for (const score of scores) {
        await tx.$executeRaw`
          INSERT INTO tournament_participants (tournament_id, user_id, role, status, joined_at)
          VALUES (${score.tournament_id}, ${score.user_id}, 'player', 'registered', ${score.created_at})
          ON CONFLICT (tournament_id, user_id) DO NOTHING
        `;
      }

      console.log(`  ✓ Created ${scores.length} tournament participants`);

      console.log('\nStep 4: Updating tournaments with club_id...');

      await tx.$executeRaw`
        UPDATE tournaments
        SET club_id = society_id,
            invite_code = gen_random_uuid()::text,
            allow_self_join = false,
            player_cap = NULL,
            leaderboard_visible = true
        WHERE society_id IS NOT NULL
      `;

      console.log('  ✓ Updated tournaments');

      console.log('\nStep 5: Adding participant_id to tournament_scores...');

      await tx.$executeRaw`
        UPDATE tournament_scores ts
        SET participant_id = tp.id
        FROM tournament_participants tp
        WHERE ts.tournament_id = tp.tournament_id
        AND ts.user_id = tp.user_id
      `;

      console.log('  ✓ Linked scores to participants');
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');

    const clubs = await prisma.club.findMany();
    const members = await prisma.clubMember.findMany();
    const participants = await prisma.tournamentParticipant.findMany();

    console.log(`  - Clubs: ${clubs.length}`);
    console.log(`  - Club Members: ${members.length}`);
    console.log(`  - Tournament Participants: ${participants.length}`);

    await prisma.$disconnect();
    console.log('\n🎉 All done!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

manualMigration();
