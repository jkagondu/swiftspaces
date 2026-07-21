import 'dotenv/config';
import prisma from './src/lib/prisma';

async function main() {
  await prisma.user.updateMany({
    where: { role: 'AGENT', agentStatus: 'PENDING' },
    data: { agentStatus: 'ACTIVE' }
  });
  console.log('Updated pending agents to ACTIVE.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
