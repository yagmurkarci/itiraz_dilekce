const BYS_BASE_URL = 'https://gatewayapi.bys.subu.edu.tr/gateway';

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
    throw new Error(`BYS isteği başarısız: ${response.status} ${errorText}`);
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
    throw new Error(`BYS program isteği başarısız: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  return {
    ogrenciId: Number(studentId),
    program: Array.isArray(data) ? data : data.program || data.dersProgramiList || [],
  };
};