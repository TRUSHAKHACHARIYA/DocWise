const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@docwise.ai',
      passwordHash,
      name: 'Demo User',
      role: 'ADMIN',
      verifiedAt: new Date()
    }
  });
  console.log('Demo user created:', user.email);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
