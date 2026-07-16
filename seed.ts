import prisma from './src/lib/prisma.js';

async function main() {
  // Check for existing agent or create one
  let agent = await prisma.user.findFirst({ where: { role: 'AGENT' } });
  if (!agent) {
    agent = await prisma.user.create({
      data: {
        email: 'agent@example.com',
        passwordHash: 'dummyhash',
        role: 'AGENT',
        agencyName: 'Swift Real Estate',
        phoneNumber: '+254712345678',
        agentStatus: 'ACTIVE'
      }
    });
  }

  // Add a property close to Nairobi CBD (lat: -1.2921, lng: 36.8219)
  await prisma.property.create({
    data: {
      title: 'Luxury Kilimani Apartment',
      description: 'Beautiful 2 bedroom apartment in the heart of Kilimani.',
      location: 'Kilimani, Nairobi',
      latitude: -1.2950,
      longitude: 36.7900,
      price: 'KES 80,000 / month',
      type: 'APARTMENT',
      status: 'FOR_RENT',
      beds: 2,
      baths: 2,
      agentId: agent.id,
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800']
    }
  });

  // Add another property a bit further
  await prisma.property.create({
    data: {
      title: 'Modern Westlands Bedsitter',
      description: 'Cozy and modern bedsitter in Westlands.',
      location: 'Westlands, Nairobi',
      latitude: -1.2650,
      longitude: 36.8000,
      price: 'KES 25,000 / month',
      type: 'BEDSITTER',
      status: 'FOR_RENT',
      beds: 1,
      baths: 1,
      agentId: agent.id,
      images: ['https://images.unsplash.com/photo-1502672260266-1c1cd2cb44c4?auto=format&fit=crop&q=80&w=800']
    }
  });

  console.log('Seeded 2 properties near Nairobi for mockup!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
