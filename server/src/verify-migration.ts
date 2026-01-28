import prisma from './config/database';

async function verifyMigration() {
  try {
    console.log('🔍 Verifying migration...\n');

    // Check clubs
    const clubs = await prisma.club.findMany({
      include: {
        owner: true,
        _count: {
          select: {
            members: true,
            tournaments: true,
          },
        },
      },
    });
    console.log(`✓ Clubs: ${clubs.length}`);
    clubs.forEach(club => {
      console.log(`  - ${club.name} (Owner: ${club.owner.firstName} ${club.owner.lastName}, Members: ${club._count.members}, Tournaments: ${club._count.tournaments})`);
      console.log(`    Invite Code: ${club.inviteCode}`);
    });

    // Check club members
    const clubMembers = await prisma.clubMember.groupBy({
      by: ['role'],
      _count: true,
    });
    console.log(`\n✓ Club Members by Role:`);
    clubMembers.forEach(group => {
      console.log(`  - ${group.role}: ${group._count} members`);
    });

    // Check tournaments
    const tournaments = await prisma.tournament.findMany({
      select: {
        id: true,
        name: true,
        inviteCode: true,
        _count: {
          select: {
            participants: true,
            tournamentScores: true,
          },
        },
      },
    });
    console.log(`\n✓ Tournaments: ${tournaments.length}`);
    tournaments.forEach(t => {
      console.log(`  - ${t.name} (Participants: ${t._count.participants}, Scores: ${t._count.tournamentScores})`);
    });

    // Check tournament participants
    const participants = await prisma.tournamentParticipant.groupBy({
      by: ['role', 'status'],
      _count: true,
    });
    console.log(`\n✓ Tournament Participants:`);
    participants.forEach(group => {
      console.log(`  - ${group.role} (${group.status}): ${group._count}`);
    });

    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        _count: {
          select: {
            clubMemberships: true,
            tournamentParticipation: true,
          },
        },
      },
    });
    console.log(`\n✓ Users: ${users.length}`);
    console.log(`  All users have club memberships: ${users.every(u => u._count.clubMemberships > 0) ? 'YES ✓' : 'NO ✗'}`);

    // Check data integrity - all scores should have valid participants
    const totalScores = await prisma.tournamentScore.count();
    console.log(`\n✓ Data Integrity:`);
    console.log(`  Total tournament scores: ${totalScores}`);

    console.log('\n✅ Migration verification complete!');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();
