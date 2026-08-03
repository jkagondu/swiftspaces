import prisma from './src/lib/prisma.js';
async function main() {
  const p = await prisma.property.findFirst({ where: { title: { contains: 'Modern Westlands Bedsitter' } } });
  console.log(p);
}
main().catch(console.error).finally(() => prisma.$disconnect());
