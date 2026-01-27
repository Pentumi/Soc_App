import prisma from '../config/database';

async function fixSocietyLink() {
  try {
    // Check if society exists
    const societies = await prisma.society.findMany();
    console.log('Societies:', societies);

    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        societyId: true,
      },
    });
    console.log('Users:', users);

    if (societies.length > 0 && users.length > 0) {
      const society = societies[0];
      console.log(`\nFound society: ${society.name} (ID: ${society.id})`);

      // Find users not linked to any society
      const unlinkedUsers = users.filter(u => u.societyId === null);

      if (unlinkedUsers.length > 0) {
        console.log(`\nLinking ${unlinkedUsers.length} users to society "${society.name}"...`);

        for (const user of unlinkedUsers) {
          await prisma.user.update({
            where: { id: user.id },
            data: { societyId: society.id },
          });
          console.log(`✓ Linked ${user.firstName} ${user.lastName} (${user.email})`);
        }

        console.log('\n✓ All users linked to society successfully!');
      } else {
        console.log('\n✓ All users are already linked to a society');
      }

      // Also link any tournaments not linked to society
      const tournaments = await prisma.tournament.findMany({
        where: { societyId: null },
        select: { id: true, name: true },
      });

      if (tournaments.length > 0) {
        console.log(`\nLinking ${tournaments.length} tournaments to society "${society.name}"...`);

        for (const tournament of tournaments) {
          await prisma.tournament.update({
            where: { id: tournament.id },
            data: { societyId: society.id },
          });
          console.log(`✓ Linked tournament: ${tournament.name}`);
        }

        console.log('\n✓ All tournaments linked to society successfully!');
      }
    } else if (societies.length === 0) {
      console.log('\n⚠ No society found in database');
      console.log('The setup modal should create one when you fill it out');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSocietyLink();
