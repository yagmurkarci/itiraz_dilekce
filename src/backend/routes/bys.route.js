const express = require('express');

const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const dynamicAuthorize = require('../middleware/dynamic-authorize');
const bysService = require('../services/bys.service');

router.use(verifyToken);

const parseStudentId = (req, res) => {
  const studentId = Number(req.query.ogrenciId);

  if (!Number.isInteger(studentId) || studentId <= 0) {
    res.status(400).json({ error: 'Geçerli bir ogrenciId gönderilmelidir.' });
    return null;
  }

  return studentId;
};

const sendBysError = (res, error, fallbackMessage) => {
  const status = error.status === 403 ? 403 : 502;
  const message = [401, 403].includes(error.status) ? error.message : fallbackMessage;
  res.status(status).json({ error: message });
};

router.get('/student-courses', dynamicAuthorize, async (req, res) => {
  try {
    const studentId = parseStudentId(req, res);
    if (!studentId) return;

    await bysService.assertStudentAccess(studentId, req.user);

    const result = await bysService.getStudentCourses(studentId);

    res.status(200).json(result);
  } catch (error) {
    console.error('BYS ders listesi hatası:', error.message);
    sendBysError(res, error, 'BYS ders listesi alınamadı.');
  }
});

router.get('/student-schedule', dynamicAuthorize, async (req, res) => {
  try {
    const studentId = parseStudentId(req, res);
    if (!studentId) return;

    await bysService.assertStudentAccess(studentId, req.user);

    const result = await bysService.getStudentSchedule(studentId);

    res.status(200).json(result);
  } catch (error) {
    console.error('BYS ders programı hatası:', error.message);
    sendBysError(res, error, 'BYS ders programı alınamadı.');
  }
});

module.exports = router;
