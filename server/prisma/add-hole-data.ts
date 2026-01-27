import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// Standard par 72 course layout (common for championship courses)
const standardPar72Holes = [
  // Front 9
  { holeNumber: 1, par: 4, strokeIndex: 5, yardage: 380 },
  { holeNumber: 2, par: 4, strokeIndex: 1, yardage: 420 },
  { holeNumber: 3, par: 3, strokeIndex: 15, yardage: 180 },
  { holeNumber: 4, par: 5, strokeIndex: 3, yardage: 520 },
  { holeNumber: 5, par: 4, strokeIndex: 11, yardage: 390 },
  { holeNumber: 6, par: 4, strokeIndex: 7, yardage: 400 },
  { holeNumber: 7, par: 3, strokeIndex: 17, yardage: 165 },
  { holeNumber: 8, par: 4, strokeIndex: 9, yardage: 410 },
  { holeNumber: 9, par: 5, strokeIndex: 13, yardage: 510 },
  // Back 9
  { holeNumber: 10, par: 4, strokeIndex: 6, yardage: 385 },
  { holeNumber: 11, par: 4, strokeIndex: 2, yardage: 425 },
  { holeNumber: 12, par: 3, strokeIndex: 16, yardage: 175 },
  { holeNumber: 13, par: 5, strokeIndex: 4, yardage: 515 },
  { holeNumber: 14, par: 4, strokeIndex: 12, yardage: 395 },
  { holeNumber: 15, par: 4, strokeIndex: 8, yardage: 405 },
  { holeNumber: 16, par: 3, strokeIndex: 18, yardage: 170 },
  { holeNumber: 17, par: 4, strokeIndex: 10, yardage: 415 },
  { holeNumber: 18, par: 5, strokeIndex: 14, yardage: 525 },
];

async function addHoleData() {
  try {
    console.log('Fetching courses without hole data...');

    // Get all courses
    const courses = await prisma.course.findMany({
      where: {
        par: 72, // Only add to par 72 courses for now
      },
      include: {
        holes: true,
      },
    });

    console.log(`Found ${courses.length} par 72 courses`);

    let added = 0;
    let skipped = 0;

    for (const course of courses) {
      // Skip if course already has hole data
      if (course.holes.length > 0) {
        skipped++;
        continue;
      }

      // Add hole data
      const holeData = standardPar72Holes.map((hole) => ({
        courseId: course.id,
        holeNumber: hole.holeNumber,
        par: hole.par,
        strokeIndex: hole.strokeIndex,
        yardage: hole.yardage,
      }));

      await prisma.hole.createMany({
        data: holeData,
      });

      added++;
      console.log(`Added hole data for: ${course.name}`);

      // Stop after adding to first 20 courses to keep it manageable
      if (added >= 20) {
        console.log('Reached limit of 20 courses, stopping...');
        break;
      }
    }

    console.log(`\nCompleted!`);
    console.log(`Added hole data to: ${added} courses`);
    console.log(`Skipped (already have holes): ${skipped} courses`);
  } catch (error) {
    console.error('Error adding hole data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addHoleData();
