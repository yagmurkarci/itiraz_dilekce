const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getAllCourses = async (studentUserId = null) => {
  if (studentUserId) {
    return exports.getStudentDepartmentCourses(studentUserId);
  }

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

exports.getCourseById = async (id, studentUserId = null) => {
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

  if (studentUserId) {
    const studentCourses = await exports.getStudentDepartmentCourses(studentUserId);
    const studentCourse = studentCourses.find(({ id: courseId }) => courseId === course.id);
    if (!studentCourse) {
      throw new Error('Course not found');
    }
    return studentCourse;
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

exports.getStudentDepartmentIds = async (userId) => {
  const userDepartments = await prisma.userDepartment.findMany({
    where: { userId: Number(userId) },
    select: { departmentId: true },
  });

  return userDepartments.map((item) => item.departmentId);
};

exports.getStudentDepartmentCourses = async (userId) => {
  const departmentIds = await exports.getStudentDepartmentIds(userId);

  if (!departmentIds.length) {
    return [];
  }

  return prisma.course.findMany({
    where: {
      OR: [
        {
          courseDepartments: {
            some: {
              departmentId: { in: departmentIds },
            },
          },
        },
        {
          courseDepartments: { none: {} },
          departmentId: { in: departmentIds },
        },
      ],
    },
    include: {
      department: true,
      courseDepartments: {
        where: { departmentId: { in: departmentIds } },
        include: { department: true },
      },
    },
    orderBy: { id: 'asc' },
  }).then((courses) => courses.map((course) => ({
    ...course,
    department: course.courseDepartments[0]?.department || course.department,
  })));
};

exports.getDepartmentCourseMap = async (departmentIds = null) => {
  const records = await prisma.courseDepartment.findMany({
    where: departmentIds ? { departmentId: { in: departmentIds } } : undefined,
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