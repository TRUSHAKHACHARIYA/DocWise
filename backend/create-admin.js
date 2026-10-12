// Promote an existing, registered user to ADMIN.
//
//   node create-admin.js you@yourdomain.com
//
// Register (and verify) the account through the app first. This script never
// creates users or sets passwords, so no default credentials can end up in
// production.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node create-admin.js <email-of-registered-user>');
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user with email ${email}. Register through the app first.`);
    process.exitCode = 1;
    return;
  }

  await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
  console.log(`${email} is now an ADMIN.`);
  if (!user.verifiedAt) {
    console.warn('Note: this account has not verified its email yet; verify it before using the admin pages.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => await prisma.$disconnect());
