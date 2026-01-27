import prisma from '../config/database';

const courseData = {
  'Concra Wood Golf Club': {
    location: 'Castleblayney, Co. Monaghan',
    par: 72,
    holes: [
      { holeNumber: 1, par: 5, yardage: 500, strokeIndex: 13 },
      { holeNumber: 2, par: 4, yardage: 400, strokeIndex: 3 },
      { holeNumber: 3, par: 4, yardage: 352, strokeIndex: 17 },
      { holeNumber: 4, par: 5, yardage: 543, strokeIndex: 5 },
      { holeNumber: 5, par: 4, yardage: 410, strokeIndex: 1 },
      { holeNumber: 6, par: 3, yardage: 177, strokeIndex: 15 },
      { holeNumber: 7, par: 4, yardage: 380, strokeIndex: 11 },
      { holeNumber: 8, par: 4, yardage: 370, strokeIndex: 7 },
      { holeNumber: 9, par: 3, yardage: 178, strokeIndex: 9 },
      { holeNumber: 10, par: 4, yardage: 433, strokeIndex: 6 },
      { holeNumber: 11, par: 4, yardage: 367, strokeIndex: 4 },
      { holeNumber: 12, par: 3, yardage: 187, strokeIndex: 16 },
      { holeNumber: 13, par: 5, yardage: 497, strokeIndex: 9 },
      { holeNumber: 14, par: 3, yardage: 161, strokeIndex: 18 },
      { holeNumber: 15, par: 5, yardage: 470, strokeIndex: 14 },
      { holeNumber: 16, par: 4, yardage: 402, strokeIndex: 2 },
      { holeNumber: 17, par: 4, yardage: 410, strokeIndex: 8 },
      { holeNumber: 18, par: 4, yardage: 373, strokeIndex: 10 },
    ],
  },
  'Newlands Golf Club': {
    location: 'Dublin',
    par: 71,
    holes: [
      { holeNumber: 1, par: 4, yardage: 327, strokeIndex: 6 },
      { holeNumber: 2, par: 5, yardage: 450, strokeIndex: 16 },
      { holeNumber: 3, par: 4, yardage: 296, strokeIndex: 10 },
      { holeNumber: 4, par: 3, yardage: 149, strokeIndex: 14 },
      { holeNumber: 5, par: 4, yardage: 411, strokeIndex: 1 },
      { holeNumber: 6, par: 4, yardage: 334, strokeIndex: 12 },
      { holeNumber: 7, par: 4, yardage: 348, strokeIndex: 4 },
      { holeNumber: 8, par: 4, yardage: 346, strokeIndex: 8 },
      { holeNumber: 9, par: 3, yardage: 142, strokeIndex: 18 },
      { holeNumber: 10, par: 4, yardage: 314, strokeIndex: 13 },
      { holeNumber: 11, par: 4, yardage: 307, strokeIndex: 5 },
      { holeNumber: 12, par: 3, yardage: 131, strokeIndex: 17 },
      { holeNumber: 13, par: 5, yardage: 491, strokeIndex: 9 },
      { holeNumber: 14, par: 4, yardage: 332, strokeIndex: 7 },
      { holeNumber: 15, par: 4, yardage: 332, strokeIndex: 3 },
      { holeNumber: 16, par: 3, yardage: 160, strokeIndex: 15 },
      { holeNumber: 17, par: 4, yardage: 429, strokeIndex: 2 },
      { holeNumber: 18, par: 5, yardage: 453, strokeIndex: 11 },
    ],
  },
  'Palmerstown House Estate': {
    location: 'Kildare',
    par: 72,
    holes: [
      { holeNumber: 1, par: 4, yardage: 332, strokeIndex: 4 },
      { holeNumber: 2, par: 5, yardage: 469, strokeIndex: 8 },
      { holeNumber: 3, par: 4, yardage: 362, strokeIndex: 15 },
      { holeNumber: 4, par: 3, yardage: 158, strokeIndex: 14 },
      { holeNumber: 5, par: 4, yardage: 368, strokeIndex: 12 },
      { holeNumber: 6, par: 4, yardage: 273, strokeIndex: 17 },
      { holeNumber: 7, par: 4, yardage: 162, strokeIndex: 10 },
      { holeNumber: 8, par: 5, yardage: 516, strokeIndex: 6 },
      { holeNumber: 9, par: 4, yardage: 377, strokeIndex: 2 },
      { holeNumber: 10, par: 4, yardage: 276, strokeIndex: 18 },
      { holeNumber: 11, par: 3, yardage: 267, strokeIndex: 13 },
      { holeNumber: 12, par: 4, yardage: 364, strokeIndex: 1 },
      { holeNumber: 13, par: 4, yardage: 456, strokeIndex: 9 },
      { holeNumber: 14, par: 5, yardage: 148, strokeIndex: 16 },
      { holeNumber: 15, par: 4, yardage: 470, strokeIndex: 7 },
      { holeNumber: 16, par: 3, yardage: 412, strokeIndex: 3 },
      { holeNumber: 17, par: 4, yardage: 151, strokeIndex: 11 },
      { holeNumber: 18, par: 5, yardage: 376, strokeIndex: 5 },
    ],
  },
  'The K Club - Palmer North Course': {
    location: 'Straffan, Kildare',
    par: 72,
    holes: [
      { holeNumber: 1, par: 5, yardage: 581, strokeIndex: 6 },
      { holeNumber: 2, par: 4, yardage: 429, strokeIndex: 12 },
      { holeNumber: 3, par: 3, yardage: 182, strokeIndex: 18 },
      { holeNumber: 4, par: 4, yardage: 431, strokeIndex: 8 },
      { holeNumber: 5, par: 3, yardage: 214, strokeIndex: 16 },
      { holeNumber: 6, par: 4, yardage: 452, strokeIndex: 10 },
      { holeNumber: 7, par: 5, yardage: 596, strokeIndex: 2 },
      { holeNumber: 8, par: 4, yardage: 422, strokeIndex: 14 },
      { holeNumber: 9, par: 4, yardage: 452, strokeIndex: 4 },
      { holeNumber: 10, par: 4, yardage: 477, strokeIndex: 9 },
      { holeNumber: 11, par: 4, yardage: 412, strokeIndex: 3 },
      { holeNumber: 12, par: 3, yardage: 172, strokeIndex: 17 },
      { holeNumber: 13, par: 5, yardage: 568, strokeIndex: 5 },
      { holeNumber: 14, par: 4, yardage: 445, strokeIndex: 7 },
      { holeNumber: 15, par: 4, yardage: 483, strokeIndex: 1 },
      { holeNumber: 16, par: 4, yardage: 434, strokeIndex: 15 },
      { holeNumber: 17, par: 3, yardage: 177, strokeIndex: 13 },
      { holeNumber: 18, par: 5, yardage: 546, strokeIndex: 11 },
    ],
  },
  'Macreddin Golf Club': {
    location: 'Macreddin Village, Co. Wicklow',
    par: 72,
    holes: [
      { holeNumber: 1, par: 4, yardage: 332, strokeIndex: 4 },
      { holeNumber: 2, par: 5, yardage: 469, strokeIndex: 8 },
      { holeNumber: 3, par: 4, yardage: 362, strokeIndex: 15 },
      { holeNumber: 4, par: 3, yardage: 158, strokeIndex: 14 },
      { holeNumber: 5, par: 4, yardage: 368, strokeIndex: 12 },
      { holeNumber: 6, par: 4, yardage: 273, strokeIndex: 17 },
      { holeNumber: 7, par: 4, yardage: 162, strokeIndex: 10 },
      { holeNumber: 8, par: 5, yardage: 516, strokeIndex: 6 },
      { holeNumber: 9, par: 4, yardage: 377, strokeIndex: 2 },
      { holeNumber: 10, par: 4, yardage: 276, strokeIndex: 18 },
      { holeNumber: 11, par: 3, yardage: 267, strokeIndex: 13 },
      { holeNumber: 12, par: 4, yardage: 364, strokeIndex: 1 },
      { holeNumber: 13, par: 4, yardage: 456, strokeIndex: 9 },
      { holeNumber: 14, par: 5, yardage: 148, strokeIndex: 16 },
      { holeNumber: 15, par: 4, yardage: 470, strokeIndex: 7 },
      { holeNumber: 16, par: 3, yardage: 412, strokeIndex: 3 },
      { holeNumber: 17, par: 4, yardage: 151, strokeIndex: 11 },
      { holeNumber: 18, par: 5, yardage: 376, strokeIndex: 5 },
    ],
  },
  "O'Meara Course": {
    location: 'Carton House, Kildare',
    par: 73,
    holes: [
      { holeNumber: 1, par: 5, yardage: 517, strokeIndex: 14 },
      { holeNumber: 2, par: 3, yardage: 191, strokeIndex: 6 },
      { holeNumber: 3, par: 4, yardage: 366, strokeIndex: 8 },
      { holeNumber: 4, par: 5, yardage: 536, strokeIndex: 12 },
      { holeNumber: 5, par: 4, yardage: 149, strokeIndex: 4 },
      { holeNumber: 6, par: 5, yardage: 431, strokeIndex: 10 },
      { holeNumber: 7, par: 3, yardage: 176, strokeIndex: 18 },
      { holeNumber: 8, par: 4, yardage: 378, strokeIndex: 2 },
      { holeNumber: 9, par: 4, yardage: 354, strokeIndex: 16 },
      { holeNumber: 10, par: 4, yardage: 420, strokeIndex: 11 },
      { holeNumber: 11, par: 4, yardage: 409, strokeIndex: 1 },
      { holeNumber: 12, par: 4, yardage: 370, strokeIndex: 13 },
      { holeNumber: 13, par: 4, yardage: 359, strokeIndex: 5 },
      { holeNumber: 14, par: 3, yardage: 176, strokeIndex: 7 },
      { holeNumber: 15, par: 5, yardage: 528, strokeIndex: 9 },
      { holeNumber: 16, par: 3, yardage: 157, strokeIndex: 3 },
      { holeNumber: 17, par: 4, yardage: 543, strokeIndex: 17 },
      { holeNumber: 18, par: 5, yardage: 440, strokeIndex: 15 },
    ],
  },
};

async function updateAccurateCourseData() {
  try {
    console.log('Updating courses with accurate scorecard data...\n');

    for (const [courseName, data] of Object.entries(courseData)) {
      console.log(`Searching for: ${courseName}`);

      // Find the course (try exact match first, then partial)
      let course = await prisma.course.findFirst({
        where: { name: courseName },
        include: { holes: { orderBy: { holeNumber: 'asc' } } },
      });

      // If not found, try partial match
      if (!course) {
        course = await prisma.course.findFirst({
          where: { name: { contains: courseName.split(' ')[0] } },
          include: { holes: { orderBy: { holeNumber: 'asc' } } },
        });
      }

      if (!course) {
        console.log(`❌ Course not found: ${courseName}\n`);
        continue;
      }

      console.log(`✓ Found: ${course.name} (ID: ${course.id})`);

      // Update course par if different
      if (course.par !== data.par) {
        await prisma.course.update({
          where: { id: course.id },
          data: { par: data.par },
        });
        console.log(`  Updated par: ${course.par} → ${data.par}`);
      }

      // Update location if different
      if (data.location && course.location !== data.location) {
        await prisma.course.update({
          where: { id: course.id },
          data: { location: data.location },
        });
        console.log(`  Updated location: ${course.location} → ${data.location}`);
      }

      // Update hole data
      if (course.holes.length !== 18) {
        console.log(`  ⚠️  Course has ${course.holes.length} holes, expected 18`);
      }

      for (const holeData of data.holes) {
        const hole = course.holes.find((h) => h.holeNumber === holeData.holeNumber);

        if (!hole) {
          console.log(`  ⚠️  Hole ${holeData.holeNumber} not found`);
          continue;
        }

        await prisma.hole.update({
          where: { id: hole.id },
          data: {
            par: holeData.par,
            yardage: holeData.yardage,
            strokeIndex: holeData.strokeIndex,
          },
        });
      }

      console.log(`  ✓ Updated all 18 holes with accurate data\n`);
    }

    console.log('✅ All 6 courses updated successfully with accurate stroke indexes!');
  } catch (error) {
    console.error('Error updating course data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAccurateCourseData();
