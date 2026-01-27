import { PrismaClient } from '../src/generated/prisma';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Read courses from Excel JSON
const excelData = JSON.parse(fs.readFileSync('courses-from-excel.json', 'utf8'));

// Function to normalize course names for comparison
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .trim();
}

// Function to extract par from holes (typically 18 holes = par 72, but varies)
function estimatePar(holes: number): number {
  if (holes === 18) return 72;
  if (holes === 9) return 36;
  if (holes === 27) return 108;
  // For other hole counts, estimate par
  return Math.round(holes * 4);
}

async function main() {
  console.log('Starting to add courses from Excel...');

  // Get existing courses from database
  const existingCourses = await prisma.course.findMany({
    select: { name: true },
  });

  const existingNamesNormalized = new Set(
    existingCourses.map(c => normalizeName(c.name))
  );

  console.log(`Found ${existingCourses.length} existing courses in database.`);

  let added = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const course of excelData) {
    const courseName = course['Course Name'];
    const county = course['County/Region'];
    const holes = course['Holes'];

    if (!courseName) {
      skipped++;
      continue;
    }

    const normalizedName = normalizeName(courseName);

    // Check if course already exists
    if (existingNamesNormalized.has(normalizedName)) {
      skipped++;
      continue;
    }

    try {
      // Estimate par based on number of holes
      const par = estimatePar(holes || 18);

      await prisma.course.create({
        data: {
          name: courseName,
          location: county ? `Co. ${county}` : 'Ireland',
          par: par,
        },
      });

      added++;
      existingNamesNormalized.add(normalizedName);

      if (added % 50 === 0) {
        console.log(`Added ${added} courses...`);
      }
    } catch (error) {
      errors.push(`Failed to add ${courseName}: ${error}`);
    }
  }

  console.log(`\nCompleted!`);
  console.log(`Added: ${added} new courses`);
  console.log(`Skipped: ${skipped} courses (already exist or invalid)`);
  console.log(`Total courses in database: ${existingCourses.length + added}`);

  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    errors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more errors`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Error adding courses:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
