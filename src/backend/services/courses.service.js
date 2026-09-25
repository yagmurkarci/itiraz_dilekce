const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getAllCourses = async () => {
  return prisma.course.findMany({
    include: {
      department: true,
      courseDepartments: {
        include: {
          department: true
        }
      }
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

exports.createCourse = async (courseCode, courseName, departmentId, departmentIds = []) => {
  if (!courseCode || !courseName) {
    throw new Error('courseCode and courseName are required');
  }

  const selectedDepartments = Array.from(new Set([...(departmentIds || []), departmentId].filter(Boolean).map(Number)));

  if (!selectedDepartments.length) {
    throw new Error('At least one department is required');
  }

  const existingCourse = await prisma.course.findUnique({
    where: {
      courseCode
    }
  });

  if (existingCourse) {
    throw new Error('Course code already exists');
  }

  const course = await prisma.course.create({
    data: {
      courseCode,
      courseName,
      departmentId: selectedDepartments[0]
    }
  });

  if (selectedDepartments.length > 0) {
    await prisma.courseDepartment.createMany({
      data: selectedDepartments.map((depId) => ({
        courseId: course.id,
        departmentId: depId
      })),
      skipDuplicates: true
    });
  }

  return prisma.course.findUnique({
    where: { id: course.id },
    include: {
      department: true,
      courseDepartments: {
        include: {
          department: true
        }
      }
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

exports.getDepartmentCourseMap = async () => {
  const records = await prisma.courseDepartment.findMany({
    include: {
      department: true,
      course: true
    },
    orderBy: [{ departmentId: 'asc' }, { courseId: 'asc' }]
  });

  const map = {};

  for (const record of records) {
    const key = record.department.departmentName;
    if (!map[key]) map[key] = [];
    map[key].push(record.course.courseName);
  }

  return map;
};