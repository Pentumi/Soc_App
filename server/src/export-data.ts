import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('🔄 Exporting data from local database...');

    // Export all data
    const societies = await prisma.society.findMany();
    const users = await prisma.user.findMany();
    const courses = await prisma.course.findMany();
    const holes = await prisma.hole.findMany();
    const tournaments = await prisma.tournament.findMany();
    const tournamentScores = await prisma.tournamentScore.findMany();
    const holeScores = await prisma.holeScore.findMany();
    const handicapHistory = await prisma.handicapHistory.findMany();
    const friends = await prisma.friend.findMany();

    const data = {
      societies,
      users,
      courses,
      holes,
      tournaments,
      tournamentScores,
      holeScores,
      handicapHistory,
      friends,
      exportDate: new Date().toISOString()
    };

    // Save to file
    const outputPath = path.join(__dirname, '..', 'data-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log('✅ Data exported successfully!');
    console.log(`📁 File location: ${outputPath}`);
    console.log('\n📊 Export Summary:');
    console.log(`   - Societies: ${societies.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Holes: ${holes.length}`);
    console.log(`   - Tournaments: ${tournaments.length}`);
    console.log(`   - Tournament Scores: ${tournamentScores.length}`);
    console.log(`   - Hole Scores: ${holeScores.length}`);
    console.log(`   - Handicap History: ${handicapHistory.length}`);
    console.log(`   - Friends: ${friends.length}`);

  } catch (error) {
    console.error('❌ Error exporting data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
