const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.getUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      number: true,
      isActive: true,
      createdAt: true,
      userRoles: {
        select: {
          role: {
            select: { id: true, roleName: true }
          }
        }
      }
    },
    orderBy: { id: 'asc' }
  });

  return users.map((user) => ({
    ...user,
    role: user.userRoles[0]?.role || null,
    userRoles: undefined
  }));
};

exports.createUser = async (name, password, email, number, roleId) => {
  if (!name || !password || !email || !roleId) {
    throw new Error('name, password, email and roleId are required');
  }

  if (number && !/^05\d{9}$/.test(number)) {
    throw new Error('Phone number must contain 11 digits and start with 05');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const role = await prisma.role.findUnique({ where: { id: Number(roleId) } });
  if (!role) {
    throw new Error('Role not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      password: hashedPassword,
      email,
      number: number || null,
      userRoles: {
        create: { roleId: Number(roleId) }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      number: true,
      isActive: true,
      createdAt: true,
      userRoles: {
        select: { role: { select: { id: true, roleName: true } } }
      }
    }
  });
};

exports.updateUser = async (id, userData) => {
  const userId = parseInt(id, 10);
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { userRoles: { include: { role: true } } }
  });

  if (!currentUser) {
    throw new Error('User not found');
  }

  if (!userData.name || !userData.email || !userData.roleId) {
    throw new Error('name, email and roleId are required');
  }

  if (userData.number && !/^05\d{9}$/.test(userData.number)) {
    throw new Error('Phone number must contain 11 digits and start with 05');
  }

  const existingEmail = await prisma.user.findFirst({
    where: { email: userData.email, NOT: { id: userId } }
  });

  if (existingEmail) {
    throw new Error('Email already in use');
  }

  const selectedRole = await prisma.role.findUnique({ where: { id: Number(userData.roleId) } });
  if (!selectedRole) {
    throw new Error('Role not found');
  }

  const isRoot = currentUser.userRoles.some(({ role }) => role.roleName === 'Root');
  if (isRoot && selectedRole.roleName !== 'Root') {
    throw new Error('Root role cannot be removed');
  }

  if (!isRoot && selectedRole.roleName === 'Root') {
    throw new Error('Root role cannot be assigned here');
  }

  const data = {
    name: userData.name,
    email: userData.email,
    number: userData.number || null,
  };

  if (userData.password) {
    data.password = await bcrypt.hash(userData.password, 10);
  }

  const updatedUser = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.user.update({
      where: { id: userId },
      data,
    });

    if (!isRoot) {
      await transaction.userRole.deleteMany({ where: { userId } });
      await transaction.userRole.create({
        data: { userId, roleId: Number(userData.roleId) }
      });
    }

    return updated;
  });

  return { message: 'User updated', updateData: updatedUser };
};

exports.deleteUser = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      userRoles: {
        include: { role: true }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.userRoles.some(({ role }) => role.roleName === 'Root')) {
    throw new Error('Root user cannot be deleted');
  }

  const deletedUser = await prisma.user.delete({
    where: { id: parseInt(id, 10) },
  });

  return { message: 'User deleted successfully', user: deletedUser };
};
exports.getUserByUsername = async (username) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: username }, 
    });
  
    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  } 
  catch (error) {
    throw new Error('Error fetching user by username: ' + error.message);
  }
};
