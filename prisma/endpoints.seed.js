module.exports = async function seedEndpoints(prisma) {
  console.log("🌐 Endpoint verileri ekleniyor...");

  const endpoints = [
    // Roles
    { endpointPath: '/GetAllRoles', method: 'GET', description: 'Sistemdeki tüm rolleri getirir', routerPath: '/api/roles' },
    { endpointPath: '/CreateRole', method: 'POST', description: 'Rol oluşturmak için kullanılır', routerPath: '/api/roles' },
    { endpointPath: '/UpdateRoleById/:id', method: 'PUT', description: 'Rolü id siyle update etmek için kullanılır', routerPath: '/api/roles' },
    { endpointPath: '/DeleteRoleById/:id', method: 'DELETE', description: 'Rolü id siyle silmek için kullanılır', routerPath: '/api/roles' },

    // Users
    { endpointPath: '/GetAllUsers', method: 'GET', description: 'Tüm kullanıcıları getirir', routerPath: '/api/users' },
    { endpointPath: '/CreateUser', method: 'POST', description: 'Yeni kullanıcı oluştur', routerPath: '/api/users' },
    { endpointPath: '/UpdateUserById/:id', method: 'PUT', description: 'Kullanıcıyı güncelle', routerPath: '/api/users' },
    { endpointPath: '/DeleteUserById/:id', method: 'DELETE', description: 'Kullanıcıyı sil', routerPath: '/api/users' },

    // User Roles
    { endpointPath: '/GetAllUserRoles', method: 'GET', description: 'Tüm user-role ilişkilerini getirir', routerPath: '/api/user-roles' },
    { endpointPath: '/CreateUserRoles', method: 'POST', description: 'Kullanıcıya rol ataması yapar', routerPath: '/api/user-roles' },
    { endpointPath: '/DeleteUserRoleById/:id', method: 'DELETE', description: 'User-role ilişkisini siler', routerPath: '/api/user-roles' },

    // Departments
    { endpointPath: '/GetAllDepartments', method: 'GET', description: 'Tüm departmanları getirir', routerPath: '/api/departments' },
    { endpointPath: '/GetDepartmentById/:id', method: 'GET', description: 'ID ile departman getirir', routerPath: '/api/departments' },
    { endpointPath: '/CreateDepartment', method: 'POST', description: 'Yeni departman oluşturur', routerPath: '/api/departments' },
    { endpointPath: '/UpdateDepartmentById/:id', method: 'PUT', description: 'Departmanı günceller', routerPath: '/api/departments' },
    { endpointPath: '/DeleteDepartmentById/:id', method: 'DELETE', description: 'Departmanı siler', routerPath: '/api/departments' },

    // Courses
    { endpointPath: '/GetAllCourses', method: 'GET', description: 'Tüm kursları getirir', routerPath: '/api/courses' },
    { endpointPath: '/GetCourseById/:id', method: 'GET', description: 'ID ile kurs getirir', routerPath: '/api/courses' },
    { endpointPath: '/GetDepartmentCourseMap', method: 'GET', description: 'Bölümlere göre ders dağılımını getirir', routerPath: '/api/courses' },
    { endpointPath: '/GetStudentDepartmentCourses', method: 'GET', description: 'Öğrencinin bölümüne ait dersleri getirir', routerPath: '/api/courses' },
    { endpointPath: '/CreateCourse', method: 'POST', description: 'Yeni kurs oluşturur', routerPath: '/api/courses' },
    { endpointPath: '/UpdateCourseById/:id', method: 'PUT', description: 'Kursu günceller', routerPath: '/api/courses' },
    { endpointPath: '/DeleteCourseById/:id', method: 'DELETE', description: 'Kursu siler', routerPath: '/api/courses' },

    // Course instructors
    { endpointPath: '/GetAssignments', method: 'GET', description: 'Ders-hoca eşleşmelerini getirir', routerPath: '/api/course-instructors' },
    { endpointPath: '/AssignInstructor', method: 'POST', description: 'Derse hoca atar', routerPath: '/api/course-instructors' },
    { endpointPath: '/DeleteAssignment/:id', method: 'DELETE', description: 'Ders-hoca eşleşmesini siler', routerPath: '/api/course-instructors' },
    { endpointPath: '/SyncFromBys', method: 'POST', description: 'BYS ders-hoca eşleştirmesini senkronize eder', routerPath: '/api/course-instructors' },

    // Requests
    { endpointPath: '/GetAllRequests', method: 'GET', description: 'Tüm dilekçeleri getirir', routerPath: '/api/requests' },
    { endpointPath: '/GetRequestsByUser/:id', method: 'GET', description: 'Bir kullanıcının dilekçelerini getirir', routerPath: '/api/requests' },
    { endpointPath: '/CreateRequest', method: 'POST', description: 'Yeni dilekçe oluşturur', routerPath: '/api/requests' },
    { endpointPath: '/UpdateRequestStatus/:id', method: 'PUT', description: 'Dilekçe durumunu günceller', routerPath: '/api/requests' },
    { endpointPath: '/UpdateRequest/:id', method: 'PUT', description: 'Öğrencinin dilekçesini günceller', routerPath: '/api/requests' },
    { endpointPath: '/DeleteRequest/:id', method: 'DELETE', description: 'Öğrencinin dilekçesini siler', routerPath: '/api/requests' },
    { endpointPath: '/ForwardRequest/:id', method: 'PUT', description: 'Dilekçeyi ilgili hocaya yönlendirir', routerPath: '/api/requests' },
    { endpointPath: '/RejectRequest/:id', method: 'PUT', description: 'Dilekçeyi gerekçeli reddeder', routerPath: '/api/requests' },
    { endpointPath: '/GetAssignedRequests', method: 'GET', description: 'Hocaya atanmış dilekçeleri getirir', routerPath: '/api/requests' },
    { endpointPath: '/ReplyToRequest/:id', method: 'PUT', description: 'Hocanın dilekçeye yanıtını kaydeder', routerPath: '/api/requests' },
    { endpointPath: '/GetAcademics', method: 'GET', description: 'Akademisyenleri listeler', routerPath: '/api/users' },

    // Request Attachments
    { endpointPath: '/UploadRequestAttachment', method: 'POST', description: 'Dilekçe dosyasını yükler', routerPath: '/api/request-attachments' },
    { endpointPath: '/GetRequestAttachments/:id', method: 'GET', description: 'Dilekçeye ait ek dosyaları getirir', routerPath: '/api/request-attachments' },

    // BYS
    { endpointPath: '/student-courses', method: 'GET', description: 'Öğrencinin BYS derslerini getirir', routerPath: '/api/bys' },
    { endpointPath: '/student-schedule', method: 'GET', description: 'Öğrencinin BYS ders programını getirir', routerPath: '/api/bys' },

    // Endpoints
    { endpointPath: '/GetAllEndpoints', method: 'GET', description: 'Tüm metotları getirir', routerPath: '/api/endpoints' },
    { endpointPath: '/CreateEndpoint', method: 'POST', description: 'Tabloya yeni endpoint eklemek için kullanılır', routerPath: '/api/endpoints' },
    { endpointPath: '/UpdateEndpointById/:id', method: 'PUT', description: 'Endpointi id siyle update etmek için kullanılır', routerPath: '/api/endpoints' },
    { endpointPath: '/DeleteEndpointById/:id', method: 'DELETE', description: 'Endpointi id siyle silmek için kullanılır', routerPath: '/api/endpoints' },

    // Endpoint Roles
    { endpointPath: '/GetAllEndpointRoles', method: 'GET', description: 'Endpointlere atanmış tüm rolleri getirmek için kullanılır', routerPath: '/api/endpoint-roles' },
    { endpointPath: '/CreateEndpointRole', method: 'POST', description: 'Endpointe yeni rol atamak için kullanılır', routerPath: '/api/endpoint-roles' },
    { endpointPath: '/DeleteEndpointRoleById/:id', method: 'DELETE', description: 'Endpointe atanmış rolü silmek için kullanılır', routerPath: '/api/endpoint-roles' },

    // Projects (Yeni Eklenen)
    { endpointPath: '/GetAllProjects', method: 'GET', description: 'Tüm aktif projeleri getirir', routerPath: '/api/projects' },
    { endpointPath: '/GetProjectById', method: 'GET', description: 'IDye göre proje detaylarını getirir', routerPath: '/api/projects' },
    { endpointPath: '/CreateProject', method: 'POST', description: 'Yeni proje oluşturur', routerPath: '/api/projects' },
    { endpointPath: '/UpdateProjectById', method: 'PUT', description: 'Proje günceller', routerPath: '/api/projects' },
    { endpointPath: '/DeleteProjectById', method: 'DELETE', description: 'Projeyi siler (soft delete)', routerPath: '/api/projects' },

    // Contracts (Yeni Eklenen)
    { endpointPath: '/GetContractsByProjectId', method: 'GET', description: 'Bir projeye ait tüm sözleşme geçmişini getirir', routerPath: '/api/contracts' },
    { endpointPath: '/CreateContract', method: 'POST', description: 'Projeye yeni bir sözleşme ekler', routerPath: '/api/contracts' },
    { endpointPath: '/UpdateContractById', method: 'PUT', description: 'Sözleşme bilgilerini günceller', routerPath: '/api/contracts' },
    { endpointPath: '/DeleteContractById', method: 'DELETE', description: 'Sözleşmeyi siler (soft delete)', routerPath: '/api/contracts' },

    // Commissions (Yeni Eklenen)
    { endpointPath: '/GetCommissionsByProjectId', method: 'GET', description: 'Projeye ait tüm komisyonları ve üyelerini getirir', routerPath: '/api/commissions' },
    { endpointPath: '/CreateCommission', method: 'POST', description: 'Projeye yeni bir komisyon ve üyelerini ekler', routerPath: '/api/commissions' },
    { endpointPath: '/DeleteCommissionById', method: 'DELETE', description: 'Komisyonu ve üyelerini siler (soft delete)', routerPath: '/api/commissions' }
  ];

  for (const endpoint of endpoints) {
    const existing = await prisma.endpoint.findFirst({
      where: { 
        endpointPath: endpoint.endpointPath,
        method: endpoint.method 
      }
    });
    
    if (!existing) {
      await prisma.endpoint.create({ data: endpoint });
      console.log(`✅ Endpoint created: ${endpoint.method} ${endpoint.endpointPath}`);
    } else {
      console.log(`ℹ️ Endpoint already exists: ${endpoint.method} ${endpoint.endpointPath}`);
    }
  }

  console.log("✅ Endpoint verileri başarıyla eklendi.");
};