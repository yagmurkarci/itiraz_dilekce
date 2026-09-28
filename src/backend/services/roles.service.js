const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.getAllRoles = async () => {
  try {
    const roles = await prisma.role.findMany();
    return roles;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.createRole = async (roleName) => {
  const normalizedName = roleName?.trim();
  if (!normalizedName) {
    throw new Error('Role name is required');
  }

  const existingRole = await prisma.role.findUnique({ where: { roleName: normalizedName } });
  if (existingRole) {
    throw new Error('Role name already exists');
  }

  return prisma.role.create({
    data: { roleName: normalizedName }
  });
};

exports.updateRole = async (id, roleName) => {
  const normalizedName = roleName?.trim();
  const parsedId = parseInt(id, 10);

  if (!normalizedName) {
    throw new Error('Role name is required');
  }

  const role = await prisma.role.findUnique({ where: { id: parsedId } });
  if (!role) {
    throw new Error('Role not found');
  }

  if (role.roleName === 'Root') {
    throw new Error('Root role cannot be renamed');
  }

  const existingRole = await prisma.role.findFirst({
    where: { roleName: normalizedName, NOT: { id: parsedId } }
  });
  if (existingRole) {
    throw new Error('Role name already exists');
  }

  return prisma.role.update({
    where: { id: parsedId },
    data: { roleName: normalizedName }
  });
};

exports.deleteRole = async (id) => {
  const roleId = parseInt(id, 10);
  const roleToDelete = await prisma.role.findUnique({
    where: { id: roleId },
    include: { _count: { select: { userRoles: true } } }
  });

  if (!roleToDelete) {
    throw new Error('Role not found');
  }

  if (roleToDelete.roleName === 'Root') {
    throw new Error('Root role cannot be deleted');
  }

  if (roleToDelete._count.userRoles > 0) {
    throw new Error('This role is assigned to users and cannot be deleted');
  }

  const deletedRole = await prisma.role.delete({
    where: { id: roleId }
  });

  return { message: 'Role deleted successfully', role: deletedRole };
};

