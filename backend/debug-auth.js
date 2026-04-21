const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'demo@docwise.ai' } });
  if (!user) {
    console.log('User not found!');
    return;
  }
  
  const testPass = 'password123';
  const isValid = await bcrypt.compare(testPass, user.passwordHash);
  console.log('User found:', user.email);
  console.log('Testing password123 against hash:', isValid);
  
  if (!isValid) {
    console.log('Fixing password hash...');
    const newHash = await bcrypt.hash(testPass, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });
    console.log('Password hash updated.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
