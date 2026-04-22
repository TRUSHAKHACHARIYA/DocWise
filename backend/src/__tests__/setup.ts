import { prisma } from '../utils/prisma';

beforeAll(async () => {
  // Use a separate test database if possible, 
  // or at least clear the data before running tests
  process.env.DATABASE_URL = 'file:./test.db';
});

afterAll(async () => {
  await prisma.$disconnect();
});
