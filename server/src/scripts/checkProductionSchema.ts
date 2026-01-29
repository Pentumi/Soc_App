import prisma from '../config/database';

async function checkSchema() {
  try {
    console.log('Checking production database schema...\n');

    // Check if clubs table exists and has data
    try {
      const clubs = await prisma.club.findMany();
      console.log(`✅ clubs table exists with ${clubs.length} records`);
      if (clubs.length > 0) {
        console.log('   First club:', clubs[0]);
      }
    } catch (e: any) {
      console.log('❌ clubs table error:', e.message);
    }

    // Check if old societies table exists
    try {
      const result = await prisma.$queryRaw`SELECT COUNT(*) FROM societies`;
      console.log('✅ societies table still exists:', result);
    } catch (e: any) {
      console.log('❌ societies table does not exist (expected after migration)');
    }

    // Check users
    try {
      const users = await prisma.user.findMany({ take: 1 });
      console.log(`✅ users table exists with data`);
      if (users.length > 0) {
        console.log('   First user:', {
          id: users[0].id,
          email: users[0].email,
          firstName: users[0].firstName,
        });
      }
    } catch (e: any) {
      console.log('❌ users table error:', e.message);
    }

    // Check club_members
    try {
      const members = await prisma.clubMember.findMany();
      console.log(`✅ club_members table exists with ${members.length} records`);
    } catch (e: any) {
      console.log('❌ club_members table error:', e.message);
    }

    // Check tournaments
    try {
      const tournaments = await prisma.tournament.findMany({ take: 1 });
      console.log(`✅ tournaments table exists`);
      if (tournaments.length > 0) {
        console.log('   First tournament:', {
          id: tournaments[0].id,
          name: tournaments[0].name,
          clubId: tournaments[0].clubId,
        });
      }
    } catch (e: any) {
      console.log('❌ tournaments table error:', e.message);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkSchema();
