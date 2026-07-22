const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmins() {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { email: true }
  });
  console.log("Found admins:", admins);
}

checkAdmins().finally(() => prisma.$disconnect());
