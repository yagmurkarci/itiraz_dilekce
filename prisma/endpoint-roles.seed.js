module.exports = async function(prisma) {
  const rootRole = await prisma.role.findFirst({
    where: { roleName: 'Root' },
  });

  if (!rootRole) {
    console.error('❌ Root rolü bulunamadı.');
    return;
  }

  const allEndpoints = await prisma.endpoint.findMany();

  for (const endpoint of allEndpoints) {
    const exists = await prisma.endpointRole.findFirst({
      where: {
        endpointId: endpoint.id,
        roleId: rootRole.id,
      },
    });

    if (!exists) {
      await prisma.endpointRole.create({
        data: {
          endpointId: endpoint.id,
          roleId: rootRole.id,
        },
      });
      console.log(`✅ endpointId ${endpoint.id} için root rolü atandı.`);
    } else {
      console.log(`ℹ️ endpointId ${endpoint.id} için root rolü zaten atanmış.`);
    }
  }
};
