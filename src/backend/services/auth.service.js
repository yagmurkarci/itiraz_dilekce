const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// JWT için secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';  


exports.loginUser = async (email, password) => {
  try {
   
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    // Kullanıcı bulunamadıysa
    if (!user) {
      throw new Error('User not found');
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Kullanıcının rollerini al
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: user.id,
      },
      include: {
        role: {
          select: {
            id: true,       // roleId
            roleName: true, // roleName
          },
        },
      },
    });

    // Rolleri JWT payload'ına ekle
    const roles = userRoles.map(userRole => ({
      roleId: userRole.role.id,
      roleName: userRole.role.roleName,
    }));

    // JWT token oluştur
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roles: roles, // Buraya roller eklendi
      },
      JWT_SECRET,
      { expiresIn: '1h' } // 1 saat geçerlilik
    );

    return { token };
  } catch (error) {
    throw new Error(error.message);
  }
};
