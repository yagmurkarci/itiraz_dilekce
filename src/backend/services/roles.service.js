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

exports.createRole = async (roleName, description, createdUserId) => {
  try {
    
    const existingRole = await prisma.role.findFirst({
      where: {
        roleName: roleName
      }
    });

    if (existingRole) {
      throw new Error('Role name already exists');  
    }

    
    const newRole = await prisma.role.create({
      data: {
        roleName,
        description,  
        createdUserId: createdUserId
      }
    });

    return { message: 'Role created successfully', role: newRole };  
  } catch (error) {
    throw new Error('Error creating role: ' + error.message);  
  }
};


exports.updateRole = async (id, roleName, description) => {

  try {
    
    const existingRole = await prisma.role.findFirst({
      where: {
        roleName: roleName,
        NOT: {
          id: parseInt(id) 
        }
      }
    });

    if (existingRole) {
      throw new Error('Role name already exists'); 
    }

    const updatedRole = await prisma.role.update({
      where: {
        id: parseInt(id) 
      },
      data: {
        roleName,  
        description  
      }
    });

    return { message: 'Role updated successfully', role: updatedRole };  
  } catch (error) {
    throw new Error('Error updating role: ' + error.message);  
  }
};


exports.deleteRole = async (id) => {
  try {
    const roleToDelete = await prisma.role.findUnique({
      where: {
        id: parseInt(id)  
      }
    });

    if (!roleToDelete) {
      throw new Error('Role not found');  
    }

    // Role'yi sil
    const deletedRole = await prisma.role.delete({
      where: {
        id: parseInt(id)  
      }
    });

    return { message: 'Role deleted successfully', role: deletedRole };  
  } catch (error) {
    throw new Error('Error deleting role: ' + error.message);  
  }
};

