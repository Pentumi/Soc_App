import prisma from '../config/database';

// Fisher-Yates shuffle algorithm
function shuffle(array: number[]): number[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function randomizeStrokeIndexes() {
  try {
    console.log('Fetching all courses...');
    const courses = await prisma.course.findMany({
      include: {
        holes: {
          orderBy: { holeNumber: 'asc' },
        },
      },
    });

    console.log(`Found ${courses.length} courses. Randomizing stroke indexes...`);

    for (const course of courses) {
      if (course.holes.length !== 18) {
        console.log(`Skipping ${course.name} - has ${course.holes.length} holes`);
        continue;
      }

      // Generate random stroke indexes 1-18
      const randomIndexes = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);

      // Update each hole with its random stroke index
      for (let i = 0; i < course.holes.length; i++) {
        await prisma.hole.update({
          where: { id: course.holes[i].id },
          data: { strokeIndex: randomIndexes[i] },
        });
      }

      console.log(`✓ Updated ${course.name}`);
    }

    console.log('\n✅ All stroke indexes randomized successfully!');
  } catch (error) {
    console.error('Error randomizing stroke indexes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

randomizeStrokeIndexes();
