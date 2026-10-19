module.exports = async function(prisma) {
  const rootRole = await prisma.role.findFirst({
    where: { roleName: 'Root' },
  });

  if (!rootRole) {
    console.error('❌ Root rolü bulunamadı.');
    return;
  }

  const allEndpoints = await prisma.endpoint.findMany();

  for (const endpoint of allEndpoints) {
    const exists = await prisma.endpointRole.findFirst({
      where: {
        endpointId: endpoint.id,
        roleId: rootRole.id,
      },
    });

    if (!exists) {
      await prisma.endpointRole.create({
        data: {
          endpointId: endpoint.id,
          roleId: rootRole.id,
        },
      });
      console.log(`✅ endpointId ${endpoint.id} için root rolü atandı.`);
    } else {
      console.log(`ℹ️ endpointId ${endpoint.id} için root rolü zaten atanmış.`);
    }
  }

  const readAcademicEndpoints = [
    ['/api/courses', 'GET', '/GetAllCourses'],
    ['/api/courses', 'GET', '/GetCourseById/:id'],
    ['/api/courses', 'GET', '/GetDepartmentCourseMap'],
    ['/api/courses', 'GET', '/GetStudentDepartmentCourses'],
    ['/api/departments', 'GET', '/GetAllDepartments'],
    ['/api/departments', 'GET', '/GetDepartmentById/:id'],
    ['/api/requests', 'GET', '/GetRequestsByUser/:id'],
    ['/api/requests', 'POST', '/CreateRequest'],
    ['/api/request-attachments', 'POST', '/UploadRequestAttachment'],
    ['/api/requests', 'PUT', '/UpdateRequest/:id'],
    ['/api/requests', 'DELETE', '/DeleteRequest/:id'],
    ['/api/bys', 'GET', '/student-courses'],
    ['/api/bys', 'GET', '/student-schedule'],
  ];
  const adminEndpoints = [
    ['/api/roles', 'GET', '/GetAllRoles'],
    ['/api/users', 'GET', '/GetAllUsers'],
    ['/api/users', 'POST', '/CreateUser'],
    ['/api/users', 'PUT', '/UpdateUserById/:id'],
    ['/api/users', 'DELETE', '/DeleteUserById/:id'],
    ['/api/users', 'GET', '/GetAcademics'],
    ['/api/departments', 'GET', '/GetAllDepartments'],
    ['/api/departments', 'GET', '/GetDepartmentById/:id'],
    ['/api/courses', 'GET', '/GetAllCourses'],
    ['/api/courses', 'GET', '/GetCourseById/:id'],
    ['/api/courses', 'GET', '/GetDepartmentCourseMap'],
    ['/api/courses', 'GET', '/GetStudentDepartmentCourses'],
    ['/api/courses', 'POST', '/CreateCourse'],
    ['/api/courses', 'PUT', '/UpdateCourseById/:id'],
    ['/api/courses', 'DELETE', '/DeleteCourseById/:id'],
    ['/api/course-instructors', 'GET', '/GetAssignments'],
    ['/api/course-instructors', 'POST', '/AssignInstructor'],
    ['/api/course-instructors', 'DELETE', '/DeleteAssignment/:id'],
    ['/api/course-instructors', 'POST', '/SyncFromBys'],
    ['/api/requests', 'GET', '/GetAllRequests'],
    ['/api/requests', 'GET', '/GetRequestsByUser/:id'],
    ['/api/requests', 'POST', '/CreateRequest'],
    ['/api/requests', 'PUT', '/UpdateRequestStatus/:id'],
    ['/api/requests', 'PUT', '/ForwardRequest/:id'],
    ['/api/requests', 'PUT', '/RejectRequest/:id'],
    ['/api/request-attachments', 'POST', '/UploadRequestAttachment'],
    ['/api/request-attachments', 'GET', '/GetRequestAttachments/:id'],
    ['/api/bys', 'GET', '/student-courses'],
    ['/api/bys', 'GET', '/student-schedule'],
  ];
  const studentAffairsEndpoints = [
    ['/api/roles', 'GET', '/GetAllRoles'],
    ['/api/departments', 'GET', '/GetAllDepartments'],
    ['/api/users', 'GET', '/GetAllUsers'],
    ['/api/users', 'POST', '/CreateUser'],
    ['/api/users', 'PUT', '/UpdateUserById/:id'],
    ['/api/users', 'DELETE', '/DeleteUserById/:id'],
    ['/api/users', 'GET', '/GetAcademics'],
    ['/api/requests', 'GET', '/GetAllRequests'],
    ['/api/requests', 'PUT', '/ForwardRequest/:id'],
    ['/api/requests', 'PUT', '/RejectRequest/:id'],
  ];
  const instructorEndpoints = [
    ['/api/requests', 'GET', '/GetAssignedRequests'],
    ['/api/requests', 'PUT', '/ReplyToRequest/:id'],
    ['/api/request-attachments', 'POST', '/UploadRequestAttachment'],
  ];
  const roleGrants = {
    'Öğrenci': readAcademicEndpoints,
    'Mezun': readAcademicEndpoints,
    'Akademisyen': [...readAcademicEndpoints, ...instructorEndpoints],
    'Admin': adminEndpoints,
    'Öğrenci İşleri': studentAffairsEndpoints,
  };

  for (const [roleName, grants] of Object.entries(roleGrants)) {
    const role = await prisma.role.findUnique({ where: { roleName } });
    if (!role) continue;

    for (const [routerPath, method, endpointPath] of grants) {
      const endpoint = await prisma.endpoint.findFirst({
        where: { routerPath, method, endpointPath },
      });
      if (!endpoint) continue;

      await prisma.endpointRole.upsert({
        where: {
          endpointId_roleId: {
            endpointId: endpoint.id,
            roleId: role.id,
          },
        },
        update: {},
        create: {
          endpointId: endpoint.id,
          roleId: role.id,
        },
      });
    }
  }

  const legacyStatusEndpoint = await prisma.endpoint.findUnique({
    where: { endpointPath_method: { endpointPath: '/UpdateRequestStatus/:id', method: 'PUT' } },
    select: { id: true },
  });
  const studentAffairsRole = await prisma.role.findUnique({ where: { roleName: 'Öğrenci İşleri' } });
  if (legacyStatusEndpoint && studentAffairsRole) {
    await prisma.endpointRole.deleteMany({
      where: { endpointId: legacyStatusEndpoint.id, roleId: studentAffairsRole.id },
    });
  }
};
