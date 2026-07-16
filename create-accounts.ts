import prisma from './src/lib/prisma.js';
import bcrypt from 'bcrypt';

async function main() {
  // Create Admin
  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@swiftspaces.com' },
    update: { passwordHash: adminHash, role: 'ADMIN' },
    create: {
      email: 'admin@swiftspaces.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      agencyName: 'System Admin'
    }
  });
  console.log('Admin created: admin@swiftspaces.com / admin123');

  // Update Agent
  const agentHash = await bcrypt.hash('agent123', 10);
  await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: { passwordHash: agentHash, agentStatus: 'ACTIVE' },
    create: {
      email: 'agent@example.com',
      passwordHash: agentHash,
      role: 'AGENT',
      agencyName: 'Swift Real Estate',
      agentStatus: 'ACTIVE'
    }
  });
  console.log('Agent created/updated: agent@example.com / agent123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
