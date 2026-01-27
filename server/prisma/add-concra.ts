import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function addCourse() {
  try {
    // Check if it already exists
    const existing = await prisma.course.findFirst({
      where: {
        name: {
          contains: 'Concra',
        },
      },
    });

    if (existing) {
      console.log('Concra Wood already exists:', existing.name);
      await prisma.$disconnect();
      return;
    }

    // Add the course
    const course = await prisma.course.create({
      data: {
        name: 'Concra Wood Golf Club',
        location: 'Castleblayney, Co. Monaghan',
        par: 72,
      },
    });

    console.log('Successfully added:', course.name);
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

addCourse();
