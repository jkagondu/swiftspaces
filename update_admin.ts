import prisma from './src/lib/prisma.js';

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@swiftspaces.com' }
  });

  if (existingAdmin) {
    const updated = await prisma.user.update({
      where: { email: 'admin@swiftspaces.com' },
      data: { email: 'support@swiftspace.africa' }
    });
    console.log("Admin email updated successfully to:", updated.email);
  } else {
    const newAdmin = await prisma.user.findUnique({
      where: { email: 'support@swiftspace.africa' }
    });
    if (newAdmin) {
       console.log("Admin email support@swiftspace.africa already exists!");
    } else {
       console.log("Admin admin@swiftspaces.com not found!");
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
