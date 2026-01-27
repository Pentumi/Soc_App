import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// Standard par 72 course layout
const par72Holes = [
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

// Par 71 course layout (one less par 5)
const par71Holes = [
  // Front 9
  { holeNumber: 1, par: 4, strokeIndex: 5, yardage: 380 },
  { holeNumber: 2, par: 4, strokeIndex: 1, yardage: 420 },
  { holeNumber: 3, par: 3, strokeIndex: 15, yardage: 180 },
  { holeNumber: 4, par: 4, strokeIndex: 3, yardage: 420 },
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

// Par 70 course layout (two less par 5s)
const par70Holes = [
  // Front 9
  { holeNumber: 1, par: 4, strokeIndex: 5, yardage: 380 },
  { holeNumber: 2, par: 4, strokeIndex: 1, yardage: 420 },
  { holeNumber: 3, par: 3, strokeIndex: 15, yardage: 180 },
  { holeNumber: 4, par: 4, strokeIndex: 3, yardage: 420 },
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
  { holeNumber: 18, par: 4, strokeIndex: 14, yardage: 425 },
];

// Par 36 course layout (9 holes)
const par36Holes = [
  { holeNumber: 1, par: 4, strokeIndex: 5, yardage: 380 },
  { holeNumber: 2, par: 4, strokeIndex: 1, yardage: 420 },
  { holeNumber: 3, par: 3, strokeIndex: 9, yardage: 180 },
  { holeNumber: 4, par: 5, strokeIndex: 3, yardage: 520 },
  { holeNumber: 5, par: 4, strokeIndex: 7, yardage: 390 },
  { holeNumber: 6, par: 4, strokeIndex: 4, yardage: 400 },
  { holeNumber: 7, par: 3, strokeIndex: 8, yardage: 165 },
  { holeNumber: 8, par: 4, strokeIndex: 6, yardage: 410 },
  { holeNumber: 9, par: 5, strokeIndex: 2, yardage: 510 },
];

function getHoleLayout(par: number): any[] | null {
  switch (par) {
    case 72:
      return par72Holes;
    case 71:
      return par71Holes;
    case 70:
      return par70Holes;
    case 36:
      return par36Holes;
    default:
      // For other par values, use par 72 as default
      return par72Holes;
  }
}

async function addAllHoleData() {
  try {
    console.log('Fetching all courses...');

    // Get all courses
    const courses = await prisma.course.findMany({
      include: {
        holes: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`Found ${courses.length} total courses`);

    let added = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const course of courses) {
      // Skip if course already has hole data
      if (course.holes.length > 0) {
        skipped++;
        continue;
      }

      const holeLayout = getHoleLayout(course.par);

      if (!holeLayout) {
        errors.push(`No layout for par ${course.par}: ${course.name}`);
        skipped++;
        continue;
      }

      try {
        // Add hole data
        const holeData = holeLayout.map((hole) => ({
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

        if (added % 50 === 0) {
          console.log(`Progress: Added hole data to ${added} courses...`);
        }
      } catch (error) {
        errors.push(`Failed to add holes for ${course.name}: ${error}`);
      }
    }

    console.log(`\n=== Completed! ===`);
    console.log(`Added hole data to: ${added} courses`);
    console.log(`Skipped (already have holes): ${skipped} courses`);

    if (errors.length > 0) {
      console.log(`\nErrors (${errors.length}):`);
      errors.slice(0, 10).forEach((e) => console.log(`  - ${e}`));
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`);
      }
    }

    // Summary by par
    const summary = await prisma.course.groupBy({
      by: ['par'],
      _count: {
        par: true,
      },
      orderBy: {
        par: 'asc',
      },
    });

    console.log('\nCourses by Par:');
    summary.forEach((s) => {
      console.log(`  Par ${s.par}: ${s._count.par} courses`);
    });
  } catch (error) {
    console.error('Error adding hole data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addAllHoleData();
