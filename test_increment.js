const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const id = 'f928972e-e014-40fc-b528-0db172f702f3';
  console.log("Fetching property:", id);
  const p = await prisma.property.findUnique({ where: { id } });
  console.log("Property:", p);
  
  if (p) {
    console.log("Updating views...");
    try {
      const u = await prisma.property.update({
        where: { id },
        data: { views: { increment: 1 } }
      });
      console.log("Success! Views is now:", u.views);
    } catch (e) {
      console.error("Update failed:", e);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
