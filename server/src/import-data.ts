import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function importData() {
  try {
    console.log('🔄 Importing data to database...');

    // Read the export file
    const dataPath = path.join(__dirname, '..', 'data-export.json');
    if (!fs.existsSync(dataPath)) {
      console.error('❌ Error: data-export.json not found!');
      console.log('Please run the export script first.');
      process.exit(1);
    }

    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(fileContent);

    console.log('📊 Import Summary:');
    console.log(`   - Societies: ${data.societies.length}`);
    console.log(`   - Users: ${data.users.length}`);
    console.log(`   - Courses: ${data.courses.length}`);
    console.log(`   - Holes: ${data.holes.length}`);
    console.log(`   - Tournaments: ${data.tournaments.length}`);
    console.log(`   - Tournament Scores: ${data.tournamentScores.length}`);
    console.log(`   - Hole Scores: ${data.holeScores.length}`);
    console.log(`   - Handicap History: ${data.handicapHistory.length}`);
    console.log(`   - Friends: ${data.friends.length}`);
    console.log('\n⚠️  WARNING: This will clear existing data and import fresh data.');
    console.log('Starting import in 3 seconds...\n');

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Clear existing data (in reverse order of dependencies)
    console.log('🗑️  Clearing existing data...');
    await prisma.holeScore.deleteMany({});
    await prisma.tournamentScore.deleteMany({});
    await prisma.tournament.deleteMany({});
    await prisma.hole.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.handicapHistory.deleteMany({});
    await prisma.friend.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.society.deleteMany({});
    console.log('✅ Existing data cleared.');

    // Import data (in order of dependencies)
    console.log('\n📥 Importing new data...');

    // Societies
    if (data.societies.length > 0) {
      for (const society of data.societies) {
        await prisma.society.create({ data: society });
      }
      console.log(`✅ Imported ${data.societies.length} societies`);
    }

    // Users
    if (data.users.length > 0) {
      for (const user of data.users) {
        await prisma.user.create({ data: user });
      }
      console.log(`✅ Imported ${data.users.length} users`);
    }

    // Courses
    if (data.courses.length > 0) {
      for (const course of data.courses) {
        await prisma.course.create({ data: course });
      }
      console.log(`✅ Imported ${data.courses.length} courses`);
    }

    // Holes
    if (data.holes.length > 0) {
      for (const hole of data.holes) {
        await prisma.hole.create({ data: hole });
      }
      console.log(`✅ Imported ${data.holes.length} holes`);
    }

    // Tournaments
    if (data.tournaments.length > 0) {
      for (const tournament of data.tournaments) {
        await prisma.tournament.create({ data: tournament });
      }
      console.log(`✅ Imported ${data.tournaments.length} tournaments`);
    }

    // Tournament Scores
    if (data.tournamentScores.length > 0) {
      for (const score of data.tournamentScores) {
        await prisma.tournamentScore.create({ data: score });
      }
      console.log(`✅ Imported ${data.tournamentScores.length} tournament scores`);
    }

    // Hole Scores
    if (data.holeScores.length > 0) {
      for (const holeScore of data.holeScores) {
        await prisma.holeScore.create({ data: holeScore });
      }
      console.log(`✅ Imported ${data.holeScores.length} hole scores`);
    }

    // Handicap History
    if (data.handicapHistory.length > 0) {
      for (const history of data.handicapHistory) {
        await prisma.handicapHistory.create({ data: history });
      }
      console.log(`✅ Imported ${data.handicapHistory.length} handicap history records`);
    }

    // Friends
    if (data.friends.length > 0) {
      for (const friend of data.friends) {
        await prisma.friend.create({ data: friend });
      }
      console.log(`✅ Imported ${data.friends.length} friend relationships`);
    }

    console.log('\n🎉 Data import completed successfully!');

  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
