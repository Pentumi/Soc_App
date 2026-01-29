import express from 'express';
import prisma from '../config/database';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Debug endpoint - check database state including new Phase 6 tables
 * Call with: GET /api/admin/debug-state
 */
router.get('/debug-state', async (_req, res): Promise<any> => {
  try {
    const clubs = await prisma.club.findMany({ take: 5 });
    const members = await prisma.clubMember.findMany({ take: 10 });
    const users = await prisma.user.findMany({ take: 5, select: { id: true, email: true, firstName: true } });

    // Check new Phase 6 tables using raw SQL to verify they exist
    let phase6Status = 'checking...';
    try {
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM leagues`;
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM flights`;
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM teams`;
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM scorecards`;
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM chat_messages`;
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM photos`;
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM follows`;

      phase6Status = 'Phase 6 tables exist and accessible ✅';
    } catch (e: any) {
      phase6Status = `Phase 6 tables error: ${e.message}`;
    }

    res.json({
      clubs: clubs.length,
      clubsList: clubs,
      members: members.length,
      membersList: members,
      users: users.length,
      usersList: users,
      phase6Status,
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Debug failed',
      details: error.message,
    });
  }
});

/**
 * Test Phase 6 tables - verify new tables exist
 * Call with: GET /api/admin/test-phase6
 */
router.get('/test-phase6', async (_req, res): Promise<any> => {
  try {
    const leagueCount = await prisma.league.count();
    const flightCount = await prisma.flight.count();
    const teamCount = await prisma.team.count();
    const scorecardCount = await prisma.scorecard.count();
    const chatCount = await prisma.chatMessage.count();
    const photoCount = await prisma.photo.count();
    const followCount = await prisma.follow.count();

    res.json({
      success: true,
      message: 'Phase 6 tables verified',
      tables: {
        leagues: leagueCount,
        flights: flightCount,
        teams: teamCount,
        scorecards: scorecardCount,
        chatMessages: chatCount,
        photos: photoCount,
        follows: followCount,
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Phase 6 tables not accessible',
      details: error.message,
    });
  }
});

/**
 * Manual migration endpoint - transforms Society to Club architecture
 * Call with: POST /api/admin/migrate-to-clubs
 * Body: { "confirm": "yes" }
 */
router.post('/migrate-to-clubs', async (req, res): Promise<any> => {
  try {
    if (req.body.confirm !== 'yes') {
      return res.status(400).json({
        error: 'Please confirm migration by sending { "confirm": "yes" }',
      });
    }

    console.log('🚀 Starting manual Society → Club migration...');

    // Check if migration already done
    const existingClubs = await prisma.club.findMany();
    if (existingClubs.length > 0) {
      return res.json({
        success: true,
        message: 'Migration already completed',
        clubs: existingClubs.length,
      });
    }

    // Check if societies table exists (old schema)
    let societies: any[];
    try {
      societies = await prisma.$queryRaw`SELECT * FROM societies`;
    } catch (e) {
      return res.status(404).json({
        error: 'No societies table found. Database may be in unexpected state.',
      });
    }

    if (societies.length === 0) {
      return res.status(404).json({
        error: 'No societies found to migrate',
      });
    }

    // Run migration
    await prisma.$transaction(async (tx) => {
      // 1. Create clubs from societies
      for (const society of societies) {
        const owner = await tx.$queryRaw<any[]>`
          SELECT id FROM users
          WHERE society_id = ${society.id} AND role = 'admin'
          ORDER BY created_at LIMIT 1
        `;

        const ownerId =
          owner[0]?.id ||
          (
            await tx.$queryRaw<any[]>`
          SELECT id FROM users WHERE society_id = ${society.id} ORDER BY created_at LIMIT 1
        `
          )[0]?.id;

        await tx.$executeRaw`
          INSERT INTO clubs (id, name, invite_code, owner_id, default_format, created_at, updated_at)
          VALUES (
            ${society.id},
            ${society.name},
            ${uuidv4()},
            ${ownerId},
            ${society.default_format || 'Stroke Play'},
            ${society.created_at},
            ${society.updated_at}
          )
        `;
      }

      // 2. Create club_members from users
      const users = await tx.$queryRaw<any[]>`
        SELECT id, society_id, role, created_at FROM users WHERE society_id IS NOT NULL
      `;

      for (const user of users) {
        const clubId = user.society_id;

        const existingOwner = await tx.$queryRaw<any[]>`
          SELECT id FROM club_members WHERE club_id = ${clubId} AND role = 'owner'
        `;

        const mappedRole =
          user.role === 'admin'
            ? existingOwner.length === 0
              ? 'owner'
              : 'admin'
            : 'player';

        await tx.$executeRaw`
          INSERT INTO club_members (club_id, user_id, role, joined_at)
          VALUES (${clubId}, ${user.id}, ${mappedRole}, ${user.created_at})
        `;
      }

      // 3. Create tournament_participants
      await tx.$executeRaw`
        INSERT INTO tournament_participants (tournament_id, user_id, role, status, joined_at)
        SELECT DISTINCT
          tournament_id,
          user_id,
          'player' as role,
          'registered' as status,
          created_at
        FROM tournament_scores
        ON CONFLICT (tournament_id, user_id) DO NOTHING
      `;

      // 4. Update tournaments
      await tx.$executeRaw`
        UPDATE tournaments
        SET club_id = society_id,
            invite_code = gen_random_uuid()::text
        WHERE society_id IS NOT NULL AND club_id IS NULL
      `;

      // 5. Link scores to participants
      await tx.$executeRaw`
        UPDATE tournament_scores ts
        SET participant_id = tp.id
        FROM tournament_participants tp
        WHERE ts.tournament_id = tp.tournament_id
        AND ts.user_id = tp.user_id
        AND ts.participant_id IS NULL
      `;
    });

    const clubs = await prisma.club.findMany();
    const members = await prisma.clubMember.findMany();

    res.json({
      success: true,
      message: 'Migration completed successfully',
      clubs: clubs.length,
      members: members.length,
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    res.status(500).json({
      error: 'Migration failed',
      details: error.message,
    });
  }
});

export default router;
