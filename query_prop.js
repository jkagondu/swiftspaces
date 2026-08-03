const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.property.findFirst({ where: { title: { contains: 'Modern Westlands Bedsitter' } } });
  console.log(p);
}
main().catch(console.error).finally(() => prisma.$disconnect());
