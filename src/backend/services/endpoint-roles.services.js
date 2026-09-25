const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Endpoint-Role ilişkilerini listeleme
exports.getAllEndpointRoles = async () => {
  try {
    const endpointRoles = await prisma.endpointRole.findMany({
      include: {
        endpoint: {
          select: {
            endpointPath: true,
            method: true,
            routerPath: true,
            id: true,
          },
        },
        role: {
          select: {
            roleName: true,
            id: true,
          },
        },
      },
    });

    return endpointRoles.map(endpointRole => ({
      id: endpointRole.id,
      routerPath: endpointRole.endpoint.routerPath,
      endpointPath: endpointRole.endpoint.endpointPath,
      method: endpointRole.endpoint.method,
      endpointId: endpointRole.endpoint.id,
      roleName: endpointRole.role.roleName,
      roleId: endpointRole.role.id
    }));
  } catch (error) {
    throw new Error('Error fetching endpoint roles: ' + error.message);
  }
};

// Yeni Endpoint-Role ilişkisi ekleme
exports.createEndpointRole = async (endpointId, roleId) => {
  try {
    // Aynı rol aynı endpoint'e atanmış mı kontrol et
    const existingEndpointRole = await prisma.endpointRole.findFirst({
      where: {
        endpointId,
        roleId,
      },
    });

    if (existingEndpointRole) {
      throw new Error('This role is already assigned to the endpoint');
    }

    const newEndpointRole = await prisma.endpointRole.create({
      data: {
        endpointId,
        roleId,
      },
    });

    return { message: 'Endpoint role assigned successfully', endpointRole: newEndpointRole };
  } catch (error) {
    throw new Error('Error assigning role to endpoint: ' + error.message);
  }
};

// Endpoint-Role ilişkisinin silinmesi
exports.deleteEndpointRole = async (id) => {
  try {
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      throw new Error('Invalid endpointRoleId');
    }

    const endpointRole = await prisma.endpointRole.findUnique({
      where: {
        id: parsedId,
      },
      include: {
        endpoint: true,
        role: true,
      },
    });

    if (!endpointRole) {
      throw new Error('Endpoint role not found');
    }

    await prisma.endpointRole.delete({
      where: {
        id: parsedId,
      },
    });

    return { message: 'Endpoint role deleted successfully', endpointRole };
  } catch (error) {
    throw new Error('Error deleting endpoint role: ' + error.message);
  }
};
