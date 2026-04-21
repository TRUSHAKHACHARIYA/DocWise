const { prisma } = require('./src/utils/prisma');
const { hashPassword } = require('./src/utils/auth');

async function main() {
  await prisma.user.deleteMany({ where: { email: 'demo@docwise.ai' } });
  const passwordHash = await hashPassword('password123');
  const user = await prisma.user.create({
    data: {
      email: 'demo@docwise.ai',
      passwordHash,
      name: 'Demo Admin',
      role: 'ADMIN',
      verifiedAt: new Date()
    }
  });
  console.log('Demo user re-created with internal hasher:', user.email);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
