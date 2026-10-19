const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Kullanıcı rolleri listeleme
exports.getAllUserRoles = async () => {
  try {
    // UserRoles, User ve Role tablolarını join ederek tüm veriyi çekiyoruz
    const userRoles = await prisma.userRole.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        role: {
          select: {
            roleName: true,  // Sadece roleName'i almak için
          },
        },
      },
    });

    // Veriyi döndür
    return userRoles.map(userRole => ({
      id: userRole.id, 
      name: userRole.user.name,
      email: userRole.user.email,
      roleName: userRole.role.roleName,
    }));
  } catch (error) {
    throw new Error('Error fetching user roles: ' + error.message);
  }
};


exports.createUserRole = async (userId, roleId, createdUserId) => {
  try {
    const parsedUserId = Number(userId);
    const parsedRoleId = Number(roleId);

    // Kendi rolünü verme durumu kontrolü
    if (createdUserId !== undefined && createdUserId !== null && parsedUserId === Number(createdUserId)) {
      throw new Error('A user cannot assign a role to themselves.');
    }

    const newUserRole = await prisma.userRole.create({
      data: {
        user: {
          connect: { id: parsedUserId },
        },
        role: {
          connect: { id: parsedRoleId },
        },
      },
    });

    return {
      message: "UserRole created successfully",
      userRole: newUserRole,
    };
  } catch (error) {
    throw new Error('Error creating user role: ' + error.message);
  }
};



exports.updateUserRole = async (id, userRoleData) => {
  try {
    const updatedUserRole = null;
    return updatedUserRole;
  } catch (error) {
    throw new Error(error.message);
  }
};



exports.deleteUserRoleById = async (userRoleId) => {
  try {
  
    const parsedUserRoleId = parseInt(userRoleId, 10);

    if (isNaN(parsedUserRoleId)) {
      throw new Error('Invalid userRoleId');
    }

    
    const userRole = await prisma.userRole.findUnique({
      where: {
        id: parsedUserRoleId,  
      },
      include: {
        user: true,
        role: true,
      },
    });

    if (!userRole) {
      throw new Error('User role not found');
    }

    
    await prisma.userRole.delete({
      where: {
        id: parsedUserRoleId,  
      },
    });


    return { message: 'User role deleted successfully', userRole };
  } catch (error) {
    throw new Error('Error deleting user role: ' + error.message);
  }
};
