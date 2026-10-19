const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const rootRole = await prisma.role.upsert({
    where: { roleName: 'Root' },
    update: {},
    create: { roleName: 'Root' },
  });

  for (const roleName of ['Öğrenci', 'Mezun', 'Akademisyen', 'Admin', 'Öğrenci İşleri']) {
    await prisma.role.upsert({
      where: { roleName },
      update: {},
      create: { roleName },
    });
  }

  const rootUser = await prisma.user.upsert({
    where: { email: 'root@example.com' },
    update: {
      name: 'Root',
      password: await bcrypt.hash('yagmur', 10),
    },
    create: {
      name: 'Root',
      email: 'root@example.com',
      password: await bcrypt.hash('yagmur', 10),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: rootUser.id,
        roleId: rootRole.id,
      },
    },
    update: {},
    create: {
      userId: rootUser.id,
      roleId: rootRole.id,
    },
  });

  const endpoints = await prisma.endpoint.findMany({
    select: { id: true },
  });

  if (endpoints.length > 0) {
    await prisma.endpointRole.createMany({
      data: endpoints.map(({ id: endpointId }) => ({
        endpointId,
        roleId: rootRole.id,
      })),
      skipDuplicates: true,
    });
  }

  console.log(`Root kullanıcısı oluşturuldu/güncellendi. ${endpoints.length} endpoint Root rolüne bağlandı.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
