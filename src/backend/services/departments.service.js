const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllDepartments = async (studentUserId = null) => {
  return prisma.department.findMany({
    where: studentUserId ? { userDepartments: { some: { userId: Number(studentUserId) } } } : undefined,
    orderBy: { id: 'asc' }
  });
};

exports.getDepartmentById = async (id, studentUserId = null) => {
  const department = await prisma.department.findFirst({
    where: {
      id: parseInt(id, 10),
      ...(studentUserId ? { userDepartments: { some: { userId: Number(studentUserId) } } } : {})
    }
  });

  if (!department) {
    throw new Error('Department not found');
  }

  return department;
};

exports.createDepartment = async (departmentName) => {
  if (!departmentName) {
    throw new Error('departmentName is required');
  }

  return prisma.department.create({
    data: { departmentName }
  });
};

exports.updateDepartment = async (id, departmentName) => {
  return prisma.department.update({
    where: { id: parseInt(id, 10) },
    data: { departmentName }
  });
};

exports.deleteDepartment = async (id) => {
  return prisma.department.delete({
    where: { id: parseInt(id, 10) }
  });
};