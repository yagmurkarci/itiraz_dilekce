const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getAllCourses = async () => {
  return prisma.course.findMany({
    include: {
      department: true
    },
    orderBy: {
      id: 'asc'
    }
  });
};

exports.getCourseById = async (id) => {
  const course = await prisma.course.findUnique({
    where: {
      id: parseInt(id, 10)
    },
    include: {
      department: true
    }
  });

  if (!course) {
    throw new Error('Course not found');
  }

  return course;
};

exports.createCourse = async (courseCode, courseName, departmentId) => {
  if (!courseCode || !courseName || !departmentId) {
    throw new Error('courseCode, courseName and departmentId are required');
  }

  const existingCourse = await prisma.course.findUnique({
    where: {
      courseCode
    }
  });

  if (existingCourse) {
    throw new Error('Course code already exists');
  }

  return prisma.course.create({
    data: {
      courseCode,
      courseName,
      departmentId: parseInt(departmentId, 10)
    }
  });
};

exports.updateCourse = async (
  id,
  courseCode,
  courseName,
  departmentId
) => {
  return prisma.course.update({
    where: {
      id: parseInt(id, 10)
    },
    data: {
      courseCode,
      courseName,
      departmentId: parseInt(departmentId, 10)
    }
  });
};

exports.deleteCourse = async (id) => {
  return prisma.course.delete({
    where: {
      id: parseInt(id, 10)
    }
  });
};