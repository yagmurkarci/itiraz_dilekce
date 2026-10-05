const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const assignmentInclude = {
	course: { select: { id: true, courseCode: true, courseName: true } },
	instructor: { select: { id: true, name: true, email: true } },
};

exports.getAssignments = async () => prisma.courseInstructor.findMany({
	include: assignmentInclude,
	orderBy: [{ courseId: 'asc' }, { instructorId: 'asc' }],
});

exports.assignInstructor = async (courseId, instructorId) => {
	const parsedCourseId = Number(courseId);
	const parsedInstructorId = Number(instructorId);
	if (!Number.isInteger(parsedCourseId) || parsedCourseId < 1) throw new Error('Invalid course');
	if (!Number.isInteger(parsedInstructorId) || parsedInstructorId < 1) throw new Error('Invalid instructor');

	const [course, instructor] = await Promise.all([
		prisma.course.findUnique({ where: { id: parsedCourseId }, select: { id: true } }),
		prisma.user.findUnique({
			where: { id: parsedInstructorId },
			include: { userRoles: { include: { role: true } } },
		}),
	]);

	if (!course) throw new Error('Course not found');
	if (!instructor?.userRoles.some(({ role }) => role.roleName === 'Akademisyen')) {
		throw new Error('Selected user is not an academic');
	}

	return prisma.courseInstructor.upsert({
		where: {
			courseId_instructorId: { courseId: parsedCourseId, instructorId: parsedInstructorId },
		},
		update: {},
		create: { courseId: parsedCourseId, instructorId: parsedInstructorId },
		include: assignmentInclude,
	});
};

exports.removeAssignment = async (id) => {
	const assignmentId = Number(id);
	if (!Number.isInteger(assignmentId) || assignmentId < 1) throw new Error('Invalid assignment');

	return prisma.courseInstructor.delete({ where: { id: assignmentId } });
};
