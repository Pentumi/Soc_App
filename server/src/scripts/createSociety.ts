import prisma from '../config/database';

async function createSociety() {
  try {
    // Create the society
    const society = await prisma.society.create({
      data: {
        name: 'Castletown Golf Society', // Change this to your desired name
        defaultFormat: 'Stroke Play', // Change to: Stroke Play, Stableford, Match Play, or Scramble
      },
    });

    console.log(`✓ Created society: ${society.name}`);
    console.log(`  Default format: ${society.defaultFormat}`);
    console.log(`  Society ID: ${society.id}\n`);

    // Link all existing users to this society
    const users = await prisma.user.findMany();
    console.log(`Linking ${users.length} users to society...\n`);

    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { societyId: society.id },
      });
      console.log(`✓ Linked ${user.firstName} ${user.lastName}`);
    }

    // Link all existing tournaments to this society
    const tournaments = await prisma.tournament.findMany();
    if (tournaments.length > 0) {
      console.log(`\nLinking ${tournaments.length} tournaments to society...\n`);

      for (const tournament of tournaments) {
        await prisma.tournament.update({
          where: { id: tournament.id },
          data: { societyId: society.id },
        });
        console.log(`✓ Linked tournament: ${tournament.name}`);
      }
    }

    console.log(`\n✓ Setup complete! All members and tournaments linked to "${society.name}"`);
    console.log('\nYou can now log in and the setup modal won\'t appear.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSociety();
