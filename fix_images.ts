import prisma from './src/lib/prisma.js';

async function main() {
  const brokenUrl = 'https://images.unsplash.com/photo-1502672260266-1c1cd2cb44c4?auto=format&fit=crop&q=80&w=800';
  const workingUrl = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800';
  
  const properties = await prisma.property.findMany();
  
  for (const p of properties) {
    if (p.images && p.images.includes(brokenUrl)) {
      const newImages = p.images.map(img => img === brokenUrl ? workingUrl : img);
      await prisma.property.update({
        where: { id: p.id },
        data: { images: newImages }
      });
      console.log(`Updated property: ${p.title}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
