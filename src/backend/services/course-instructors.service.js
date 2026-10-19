const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const bysService = require('./bys.service');

const prisma = new PrismaClient();

const academicRoleNames = ['Akademisyen'];

const normalizeCourseName = (value) => String(value || '').toLocaleUpperCase('tr-TR').replace(/\s+/g, ' ').trim();

const assignmentInclude = {
	course: {
		select: {
			id: true,
			courseCode: true,
			courseName: true,
			department: { select: { departmentName: true } },
			courseDepartments: { select: { department: { select: { departmentName: true } } } },
		},
	},
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
	if (!instructor?.userRoles.some(({ role }) => academicRoleNames.includes(role.roleName))) {
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

const turkishCharacterMap = {
	'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u',
};

const stripAcademicTitles = (value) => {
	let name = String(value || '').trim();
	const titlePattern = /^(prof\.?|doç\.?|dr\.?|öğr\.?|gör\.?|üyesi\.?)\s+/i;

	while (titlePattern.test(name)) {
		name = name.replace(titlePattern, '').trim();
	}

	return name;
};

const transliterate = (value) => String(value || '')
	.replace(/İ/g, 'i')
	.replace(/I/g, 'i')
	.toLowerCase('tr-TR')
	.replace(/[çğıöşüâîû]/g, (character) => turkishCharacterMap[character] || character);

const normalizePersonKey = (value) => transliterate(stripAcademicTitles(value)).replace(/[^a-z0-9]/g, '');

const buildInstructorEmail = (value) => {
	const localPart = transliterate(stripAcademicTitles(value))
		.replace(/[^a-z0-9\s]/g, '')
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.join('.');

	return `${localPart}@subu.edu.tr`;
};

const ensureInstructorUser = async (instructorName, rolesByName, existingUsers) => {
	const key = normalizePersonKey(instructorName);
	const existing = existingUsers.find((user) => normalizePersonKey(user.name) === key);

	if (existing) {
		if (!existing.userRoles.some(({ role }) => academicRoleNames.includes(role.roleName))) {
			await prisma.userRole.create({
				data: { userId: existing.id, roleId: rolesByName['Akademisyen'].id },
			});
		}

		return { user: existing, created: false };
	}

	const email = buildInstructorEmail(instructorName);
	const emailTaken = existingUsers.some((user) => user.email.toLowerCase() === email.toLowerCase());
	const finalEmail = emailTaken
		? email.replace('@', `.${crypto.randomBytes(2).toString('hex')}@`)
		: email;
	const temporaryPassword = `Bys${crypto.randomBytes(4).toString('hex')}`;

	const user = await prisma.user.create({
		data: {
			name: stripAcademicTitles(instructorName),
			email: finalEmail,
			password: await bcrypt.hash(temporaryPassword, 10),
			userRoles: {
				create: { roleId: rolesByName['Akademisyen'].id },
			},
		},
		include: { userRoles: { include: { role: true } } },
	});

	existingUsers.push(user);

	return { user, created: true, email: finalEmail, temporaryPassword };
};

exports.syncFromBys = async ({ ogrenciId }) => {
	const rawStudentId = String(ogrenciId ?? '').trim();
	const numericStudentId = Number(rawStudentId);

	if (!rawStudentId || (!Number.isInteger(numericStudentId) && !rawStudentId.includes('@'))) {
		throw new Error('Geçerli bir BYS öğrenci ID veya numarası gereklidir');
	}

	const student = await prisma.user.findFirst({
		where: {
			OR: [
				...(Number.isInteger(numericStudentId) && numericStudentId > 0 && numericStudentId <= 2147483647
					? [{ bysStudentId: numericStudentId }]
					: []),
				{ number: rawStudentId },
				{ email: { startsWith: `${rawStudentId.replace(/@.*$/, '')}@` } },
			],
		},
		include: { userDepartments: true },
	});

	if (!student?.bysStudentId) {
		throw new Error('Bu öğrenci için BYS Ogrenci ID tanımlı değil. Önce kullanıcı kaydına BYS Öğrenci ID girin.');
	}

	const parsedStudentId = student.bysStudentId;
	const studentDepartmentIds = student.userDepartments.map(({ departmentId }) => departmentId);
	const items = await bysService.getStudentCourseInstructors(parsedStudentId);

	const departmentCounts = items.reduce((counts, item) => {
		if (item.departmentName) counts[item.departmentName] = (counts[item.departmentName] || 0) + 1;
		return counts;
	}, {});
	const programDepartmentName = Object.entries(departmentCounts)
		.sort(([, firstCount], [, secondCount]) => secondCount - firstCount)[0]?.[0] || null;

	const roles = await prisma.role.findMany();
	const rolesByName = Object.fromEntries(roles.map((role) => [role.roleName, role]));
	if (!rolesByName['Akademisyen']) {
		throw new Error('Akademisyen rolü bulunamadı');
	}

	const existingUsers = await prisma.user.findMany({
		include: { userRoles: { include: { role: true } } },
	});

	const summary = {
		courses: 0,
		coursesCreated: 0,
		assignments: 0,
		instructorsCreated: 0,
		instructorCount: 0,
		createdAccounts: [],
		skipped: [],
	};
	const instructorNames = new Set();
	const legacyCourses = await prisma.course.findMany({ where: { bysCourseId: null } });

	for (const item of items) {
		if (!item.bysCourseId || !item.courseCode || !item.courseName) {
			summary.skipped.push(item.courseCode || item.courseName || 'bilinmeyen ders');
			continue;
		}

		const primaryDepartmentId = studentDepartmentIds[0];
		if (!primaryDepartmentId) {
			summary.skipped.push(`${item.courseName} (program bulunamadı)`);
			continue;
		}

		let course = await prisma.course.findUnique({ where: { bysCourseId: item.bysCourseId } });

		if (course) {
			course = await prisma.course.update({
				where: { id: course.id },
				data: { courseCode: item.courseCode, courseName: item.courseName, departmentId: primaryDepartmentId },
			});
		} else {
			const normalizedName = normalizeCourseName(item.courseName);
			const legacyIndex = legacyCourses.findIndex(
				(candidate) => normalizeCourseName(candidate.courseName) === normalizedName
			);
			const legacyCourse = legacyIndex >= 0 ? legacyCourses[legacyIndex] : null;

			if (legacyCourse) {
				course = await prisma.course.update({
					where: { id: legacyCourse.id },
					data: {
						courseCode: item.courseCode,
						courseName: item.courseName,
						bysCourseId: item.bysCourseId,
						departmentId: primaryDepartmentId,
					},
				});
				legacyCourses.splice(legacyIndex, 1);
			} else {
				course = await prisma.course.create({
					data: {
						courseCode: item.courseCode,
						courseName: item.courseName,
						bysCourseId: item.bysCourseId,
						departmentId: primaryDepartmentId,
					},
				});
				summary.coursesCreated += 1;
			}
		}

		summary.courses += 1;

		const isCommonCourse = Boolean(
			programDepartmentName && item.departmentName && item.departmentName !== programDepartmentName
		);
		const linkedDepartmentIds = isCommonCourse
			? (await prisma.department.findMany({ select: { id: true } })).map(({ id }) => id)
			: studentDepartmentIds;

		await prisma.courseDepartment.createMany({
			data: linkedDepartmentIds.map((departmentId) => ({ courseId: course.id, departmentId })),
			skipDuplicates: true,
		});

		if (!item.instructorName) {
			summary.skipped.push(`${item.courseCode} (hoca yok)`);
			continue;
		}

		const ensured = await ensureInstructorUser(item.instructorName, rolesByName, existingUsers);
		if (ensured.created) {
			summary.instructorsCreated += 1;
			summary.createdAccounts.push({
				name: ensured.user.name,
				email: ensured.email,
				temporaryPassword: ensured.temporaryPassword,
			});
		}

		await prisma.courseInstructor.upsert({
			where: {
				courseId_instructorId: { courseId: course.id, instructorId: ensured.user.id },
			},
			update: {},
			create: { courseId: course.id, instructorId: ensured.user.id },
		});

		summary.assignments += 1;
		instructorNames.add(ensured.user.name);
	}

	summary.instructorCount = instructorNames.size;
	return summary;
};
