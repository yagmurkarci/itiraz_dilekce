const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getEligibleCourseDepartment = async (userId, courseId) => {
  const [user, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: Number(userId) }, include: { userDepartments: true } }),
    prisma.course.findUnique({ where: { id: Number(courseId) }, include: { courseDepartments: true } }),
  ]);
  if (!user) throw new Error('User not found');
  if (!course) throw new Error('Course not found');

  const studentDepartmentIds = user.userDepartments.map(({ departmentId }) => departmentId);
  const courseDepartmentIds = course.courseDepartments.length
    ? course.courseDepartments.map(({ departmentId }) => departmentId)
    : [course.departmentId];
  const departmentId = courseDepartmentIds.find((id) => studentDepartmentIds.includes(id));
  if (!departmentId) throw new Error('Course is not assigned to your department');

  return { course, departmentId };
};

exports.createRequest = async ({
  title,
  description,
  requestType,
  createdBy,
  courseId,
  departmentId,
  attachments = [],
}) => {
  if (!title?.trim()) throw new Error('Title is required');
  if (!description?.trim()) throw new Error('Description is required');
  if (!requestType?.trim()) throw new Error('Request type is required');
  if (!createdBy) throw new Error('Created by is required');
  if (!courseId) throw new Error('Course is required');
  if (!departmentId) throw new Error('Department is required');

  const { course, departmentId: eligibleDepartmentId } = await getEligibleCourseDepartment(createdBy, courseId);
  const selectedDepartmentId = Number(departmentId) === eligibleDepartmentId ? Number(departmentId) : eligibleDepartmentId;
  const department = await prisma.department.findUnique({ where: { id: selectedDepartmentId } });
  if (!department) throw new Error('Department not found');

  const request = await prisma.request.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      requestType: requestType.trim(),
      createdBy: Number(createdBy),
      courseId: Number(courseId),
      departmentId: department.id,
      status: 'PENDING',
    },
  });

  if (attachments && attachments.length) {
    await prisma.requestAttachment.createMany({
      data: attachments.map((attachment) => ({
        requestId: request.id,
        uploadedBy: Number(createdBy),
        filePath: attachment.filePath,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
      })),
    });
  }

  return request;
};

exports.updateRequestByStudent = async ({ requestId, userId, title, description, courseId }) => {
  const request = await prisma.request.findUnique({ where: { id: Number(requestId) } });
  if (!request || request.createdBy !== Number(userId)) throw new Error('Request not found');
  if (request.status !== 'PENDING' || request.assignedTo) throw new Error('Only unassigned pending requests can be edited');
  if (!title?.trim() || !description?.trim()) throw new Error('Title and description are required');

  const { course, departmentId } = await getEligibleCourseDepartment(userId, courseId || request.courseId);
  return prisma.request.update({
    where: { id: request.id },
    data: {
      title: title.trim(),
      description: description.trim(),
      courseId: course.id,
      departmentId,
      updatedAt: new Date(),
    },
    include: { course: true, department: true, attachments: true },
  });
};

exports.deleteRequestByStudent = async ({ requestId, userId }) => {
  const request = await prisma.request.findUnique({ where: { id: Number(requestId) } });
  if (!request || request.createdBy !== Number(userId)) throw new Error('Request not found');
  if (request.status !== 'PENDING' || request.assignedTo) throw new Error('Only unassigned pending requests can be deleted');
  return prisma.request.delete({ where: { id: request.id } });
};

exports.getRequestsByUser = async (userId) => {
  return prisma.request.findMany({
    where: { createdBy: Number(userId) },
    include: {
      course: true,
      department: true,
      attachments: true,
      assignee: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

exports.getAllRequests = async () => {
  return prisma.request.findMany({
    include: {
      course: { include: { instructors: { include: { instructor: { select: { id: true, name: true, email: true } } } } } },
      department: true,
      creator: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      attachments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

exports.getAssignedRequests = async (instructorId) => {
  const parsedInstructorId = Number(instructorId);
  const courseAssignments = await prisma.courseInstructor.findMany({
    where: { instructorId: parsedInstructorId },
    select: { courseId: true },
  });

  const courseIds = courseAssignments.map(({ courseId }) => courseId);

  return prisma.request.findMany({
    where: {
      OR: [
        { assignedTo: parsedInstructorId },
        ...(courseIds.length ? [{ courseId: { in: courseIds } }] : []),
      ],
    },
    include: {
      course: true,
      department: true,
      creator: { select: { id: true, name: true, email: true } },
      attachments: true,
      assignee: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
};

exports.forwardRequest = async ({ requestId, instructorId }) => {
  const request = await prisma.request.findUnique({ where: { id: Number(requestId) } });
  if (!request) throw new Error('Request not found');
  if (request.status === 'REJECTED' || request.status === 'ANSWERED') throw new Error('Request is already closed');

  const assignment = await prisma.courseInstructor.findUnique({
    where: { courseId_instructorId: { courseId: request.courseId, instructorId: Number(instructorId) } },
  });
  if (!assignment) throw new Error('Selected instructor is not assigned to this course');

  return prisma.request.update({
    where: { id: request.id },
    data: { assignedTo: Number(instructorId), status: 'IN_REVIEW', rejectionReason: null, updatedAt: new Date() },
  });
};

exports.rejectRequest = async ({ requestId, rejectionReason }) => {
  const request = await prisma.request.findUnique({ where: { id: Number(requestId) } });
  if (!request) throw new Error('Request not found');
  if (!rejectionReason?.trim()) throw new Error('A rejection reason is required');
  if (request.status === 'ANSWERED' || request.status === 'REJECTED') throw new Error('Request is already closed');

  return prisma.request.update({
    where: { id: request.id },
    data: { status: 'REJECTED', rejectionReason: rejectionReason.trim(), assignedTo: null, updatedAt: new Date() },
  });
};

exports.replyToRequest = async ({ requestId, instructorId, answer }) => {
  const request = await prisma.request.findUnique({ where: { id: Number(requestId) } });
  if (!request || request.assignedTo !== Number(instructorId)) throw new Error('Request is not assigned to you');
  if (request.status !== 'IN_REVIEW') throw new Error('Request is not ready for an instructor response');
  if (!answer?.trim()) throw new Error('An answer is required');

  const examPaper = await prisma.requestAttachment.findFirst({
    where: { requestId: request.id, uploadedBy: Number(instructorId) },
  });
  if (!examPaper) throw new Error('Upload the reviewed exam paper before submitting your answer');

  return prisma.request.update({
    where: { id: request.id },
    data: { answer: answer.trim(), status: 'ANSWERED', updatedAt: new Date() },
  });
};

exports.updateRequestStatus = async ({ requestId, status, answer, assignedTo, newGrade, rejectionReason }) => {
  const request = await prisma.request.findUnique({ where: { id: Number(requestId) } });
  if (!request) throw new Error('Request not found');

  const validStatuses = ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ANSWERED'];
  if (status !== undefined && !validStatuses.includes(status)) {
    throw new Error('Invalid request status');
  }

  const data = { updatedAt: new Date() };
  if (status !== undefined) data.status = status;
  if (answer !== undefined) data.answer = answer;
  if (assignedTo !== undefined) data.assignedTo = assignedTo ? Number(assignedTo) : null;
  if (newGrade !== undefined) data.newGrade = newGrade === null ? null : Number(newGrade);
  if (rejectionReason !== undefined) data.rejectionReason = rejectionReason;

  return prisma.request.update({
    where: { id: Number(requestId) },
    data,
  });
};
