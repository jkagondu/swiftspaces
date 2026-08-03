const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    // If it doesn't exist, check if support@swiftspace.africa already exists
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
