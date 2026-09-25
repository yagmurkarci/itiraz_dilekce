const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.getUsers = async () => {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.createUser = async (username, password, email, gsm) => {
  try {
      // E-posta ve GSM numarası mevcutluk kontrol
      const existingUser = await prisma.user.findFirst({
          where: {
              OR: [
                  { email: email },
                  { gsm: gsm }
              ]
          }
      });

      if (existingUser) {
          throw new Error('Email or GSM number already in use');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
          data: {
              username,
              password: hashedPassword,
              email,
              gsm
          }
      });

      return newUser;
  } catch (error) {
      throw new Error('Error creating user: ' + error.message);
  }
};

exports.updateUser = async (id, userData) => {
  try {
    // E-posta, GSM numarası veya kullanıcı adı çakışması kontrol
    if (userData.email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: userData.email,
          NOT: { id: parseInt(id) } 
        }
      });

      if (existingEmail) {
        throw new Error('Email already in use.');
      }
    }

    if (userData.gsm) {
      const existingGsm = await prisma.user.findFirst({
        where: {
          gsm: userData.gsm,
          NOT: { id: parseInt(id) }
        }
      });

      if (existingGsm) {
        throw new Error('GSM number already in use.');
      }
    }

    if (userData.username) {
      const existingUsername = await prisma.user.findFirst({
        where: {
          username: userData.username,
          NOT: { id: parseInt(id) }
        }
      });

      if (existingUsername) {
        throw new Error('Username already in use.');
      }
    }

    // Eğer şifre güncellenmişse, şifreyi hash'le
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10); 
    }

    
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) }, 
      data: userData, 
    });

    return { message: "User updated", updateData: updatedUser };
  } catch (error) {
    throw new Error('Error updating user: ' + error.message); 
  }
};

exports.deleteUser = async (id) => {
  try {
   
    const deletedUser = await prisma.user.delete({
      where: { id: parseInt(id) },
    });

 
    return { message: 'User deleted successfully', user: deletedUser }; 
  } catch (error) {
    throw new Error('Error deleting user: ' + error.message); 
  }
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
