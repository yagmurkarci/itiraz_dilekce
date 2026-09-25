const { PrismaClient } = require('@prisma/client');
const seedEndpoints = require('./endpoints.seed');
const seedEndpointRoles = require('./endpoint-roles.seed');

const prisma = new PrismaClient();

async function main() {
  await seedEndpoints(prisma);
  await seedEndpointRoles(prisma);
  console.log('✅ Endpoint seed işlemleri tamamlandı.');
}

main()
  .catch((error) => {
    console.error('❌ Endpoint seed işlemleri başarısız:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
