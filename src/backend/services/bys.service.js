const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const BYS_BASE_URL = process.env.BYS_BASE_URL || 'https://gatewayapi.bys.subu.edu.tr/gateway';

const createBysError = (response, errorText) => {
  const error = new Error(
    response.status === 401
      ? 'BYS oturumu sona ermiş (token süresi dolmuş). Lütfen BYS_TOKEN güncellensin.'
      : `BYS isteği başarısız: ${response.status} ${errorText}`
  );
  error.status = response.status;
  return error;
};

exports.assertStudentAccess = async (studentId, user) => {
  const roleNames = (user?.roles || []).map(({ roleName }) => roleName);

  if (roleNames.some((roleName) => ['Root', 'Admin', 'Öğrenci İşleri'].includes(roleName))) {
    return;
  }

  const record = await prisma.user.findUnique({
    where: { id: Number(user?.userId) },
    select: { bysStudentId: true },
  });

  if (!record || record.bysStudentId !== Number(studentId)) {
    const error = new Error('Bu öğrencinin BYS kaydına erişim yetkiniz yok.');
    error.status = 403;
    throw error;
  }
};

exports.getStudentCourses = async (studentId) => {
  if (!process.env.BYS_TOKEN) {
    throw new Error('BYS_TOKEN .env dosyasında bulunamadı.');
  }

  const url = new URL(
    `${BYS_BASE_URL}/OgrenciOgretimPlani/GetSecilenDersListByOgrenciId`
  );

  url.searchParams.set('ogrenciId', String(studentId));

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.BYS_TOKEN}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw createBysError(response, errorText);
  }

  const data = await response.json();
  
  return {
    ogrenciId: Number(studentId),
    dersler: data.ogrenciYazilmaList || [],
    akademikYillar: data.akademikYilList || [],
  };
};

exports.getStudentSchedule = async (studentId) => {
  if (!process.env.BYS_TOKEN) {
    throw new Error('BYS_TOKEN .env dosyasında bulunamadı.');
  }

  const url = new URL(
    `${BYS_BASE_URL}/DersProgrami/GetOgretimPlaniDersProgramiTakvimByOgrenciId`
  );

  url.searchParams.set('ogrenciId', String(studentId));

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.BYS_TOKEN}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw createBysError(response, errorText);
  }

  const data = await response.json();

  return {
    ogrenciId: Number(studentId),
    program: Array.isArray(data) ? data : data.program || data.dersProgramiList || [],
  };
};

const fetchBysJson = async (path) => {
  if (!process.env.BYS_TOKEN) {
    throw new Error('BYS_TOKEN .env dosyasında bulunamadı.');
  }

  const response = await fetch(`${BYS_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.BYS_TOKEN}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw createBysError(response, errorText);
  }

  return response.json();
};

const mapWithConcurrency = async (items, limit, mapper) => {
  const results = new Array(items.length);
  let cursor = 0;

  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
};

exports.getStudentCourseInstructors = async (studentId) => {
  const parsedStudentId = Number(studentId);
  const data = await fetchBysJson(
    `/OgrenciOgretimPlani/GetSecilenDersListByOgrenciId?ogrenciId=${parsedStudentId}`
  );

  const sectionMap = new Map();
  for (const enrollment of data.ogrenciYazilmaList || []) {
    if (enrollment.ogretimPlaniDersSubeId && !sectionMap.has(enrollment.ogretimPlaniDersSubeId)) {
      sectionMap.set(enrollment.ogretimPlaniDersSubeId, enrollment);
    }
  }

  const sections = [...sectionMap.entries()];
  return mapWithConcurrency(sections, 5, async ([sectionId, enrollment]) => {
    const [detail, department] = await Promise.all([
      fetchBysJson(
        `/DersDetayBilgisi/GetDersGenelBilgisiByOgretimPlaniDersSubeId?ogretimPlaniDersSubeId=${sectionId}`
      ),
      fetchBysJson(
        `/DersDetayBilgisi/GetDersDetayByOgretimPlaniDersSubeId?ogretimPlaniDersSubeId=${sectionId}`
      ).catch(() => null),
    ]);

    return {
      bysCourseId: Number(detail.id),
      courseCode: detail.dersKodu,
      courseName: detail.ad,
      instructorName: detail.ogretimGorevlisi || null,
      credit: detail.akts,
      courseType: detail.dersTuru,
      sectionName: detail.dersGrup,
      departmentName: department?.bolum || null,
      facultyName: department?.fakulte || null,
      academicYear: enrollment.yazilmaAkademikYil || null,
      term: enrollment.yazilmaAkademikDonemTuru || null,
    };
  });
};