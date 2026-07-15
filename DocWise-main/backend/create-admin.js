const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin12345', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@docwise.ai' },
    update: { passwordHash },
    create: {
      email: 'admin@docwise.ai',
      passwordHash,
      name: 'Primary Admin',
      role: 'ADMIN',
      verifiedAt: new Date()
    }
  });
  console.log('Admin user ready:', user.email);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
