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
    ['/api/departments', 'GET', '/GetAllDepartments'],
    ['/api/departments', 'GET', '/GetDepartmentById/:id'],
  ];
  const adminEndpoints = [
    ['/api/roles', 'GET', '/GetAllRoles'],
    ['/api/users', 'GET', '/GetAllUsers'],
    ['/api/users', 'POST', '/CreateUser'],
    ['/api/users', 'PUT', '/UpdateUserById/:id'],
    ['/api/users', 'DELETE', '/DeleteUserById/:id'],
    ['/api/departments', 'GET', '/GetAllDepartments'],
    ['/api/departments', 'GET', '/GetDepartmentById/:id'],
    ['/api/courses', 'GET', '/GetAllCourses'],
    ['/api/courses', 'GET', '/GetCourseById/:id'],
    ['/api/courses', 'GET', '/GetDepartmentCourseMap'],
    ['/api/courses', 'POST', '/CreateCourse'],
    ['/api/courses', 'PUT', '/UpdateCourseById/:id'],
    ['/api/courses', 'DELETE', '/DeleteCourseById/:id'],
  ];
  const studentAffairsEndpoints = [
    ['/api/roles', 'GET', '/GetAllRoles'],
    ['/api/departments', 'GET', '/GetAllDepartments'],
    ['/api/users', 'GET', '/GetAllUsers'],
    ['/api/users', 'POST', '/CreateUser'],
    ['/api/users', 'PUT', '/UpdateUserById/:id'],
    ['/api/users', 'DELETE', '/DeleteUserById/:id'],
  ];
  const roleGrants = {
    'Öğrenci': readAcademicEndpoints,
    'Mezun': readAcademicEndpoints,
    'Akademisyen': readAcademicEndpoints,
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
};
