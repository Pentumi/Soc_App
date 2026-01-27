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
    console.log('Starting import in 2 seconds...\n');

    await new Promise(resolve => setTimeout(resolve, 2000));

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

    // Import data using batch operations (MUCH faster!)
    console.log('\n📥 Importing new data...');

    // Societies
    if (data.societies.length > 0) {
      await prisma.society.createMany({ data: data.societies });
      console.log(`✅ Imported ${data.societies.length} societies`);
    }

    // Users
    if (data.users.length > 0) {
      await prisma.user.createMany({ data: data.users });
      console.log(`✅ Imported ${data.users.length} users`);
    }

    // Courses
    if (data.courses.length > 0) {
      await prisma.course.createMany({ data: data.courses });
      console.log(`✅ Imported ${data.courses.length} courses`);
    }

    // Holes - batch import in chunks of 1000 for better performance
    if (data.holes.length > 0) {
      const chunkSize = 1000;
      const chunks = Math.ceil(data.holes.length / chunkSize);
      console.log(`⏳ Importing ${data.holes.length} holes in ${chunks} batches...`);

      for (let i = 0; i < data.holes.length; i += chunkSize) {
        const chunk = data.holes.slice(i, i + chunkSize);
        await prisma.hole.createMany({ data: chunk });
        const progress = Math.min(i + chunkSize, data.holes.length);
        console.log(`   📦 Batch ${Math.floor(i / chunkSize) + 1}/${chunks}: ${progress}/${data.holes.length} holes`);
      }
      console.log(`✅ Imported ${data.holes.length} holes`);
    }

    // Tournaments
    if (data.tournaments.length > 0) {
      await prisma.tournament.createMany({ data: data.tournaments });
      console.log(`✅ Imported ${data.tournaments.length} tournaments`);
    }

    // Tournament Scores
    if (data.tournamentScores.length > 0) {
      await prisma.tournamentScore.createMany({ data: data.tournamentScores });
      console.log(`✅ Imported ${data.tournamentScores.length} tournament scores`);
    }

    // Hole Scores
    if (data.holeScores.length > 0) {
      await prisma.holeScore.createMany({ data: data.holeScores });
      console.log(`✅ Imported ${data.holeScores.length} hole scores`);
    }

    // Handicap History
    if (data.handicapHistory.length > 0) {
      await prisma.handicapHistory.createMany({ data: data.handicapHistory });
      console.log(`✅ Imported ${data.handicapHistory.length} handicap history records`);
    }

    // Friends
    if (data.friends.length > 0) {
      await prisma.friend.createMany({ data: data.friends });
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
