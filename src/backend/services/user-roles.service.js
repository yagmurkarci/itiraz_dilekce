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
            username: true,  // Sadece username'yi almak için
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
      username: userRole.user.username,
      roleName: userRole.role.roleName,
    }));
  } catch (error) {
    throw new Error('Error fetching user roles: ' + error.message);
  }
};


exports.createUserRole = async (userId, roleId, createdUserId) => {
  try {
    // Kendi rolünü verme durumu kontrolü
    if (userId === createdUserId) {
      throw new Error('A user cannot assign a role to themselves.');
    }
    
      

    
    const newUserRole = await prisma.userRole.create({
      data: {
        user: {
          connect: { id: userId },  
        },
        role: {
          connect: { id: roleId },  
        },
        createdUserId: createdUserId,  
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

    
    // Kendi rolünü silmek isteyen kullanıcıyı kontrol et
    if (userRole.user.id === userRole.createdUserId) {
      throw new Error('User cannot delete their own role');
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
