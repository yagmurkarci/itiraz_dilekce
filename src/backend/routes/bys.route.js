const express = require('express');

const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const bysService = require('../services/bys.service');

router.use(verifyToken);

router.get('/student-courses', async (req, res) => {
  try {
    const studentId = Number(req.query.ogrenciId);

    if (!Number.isInteger(studentId) || studentId <= 0) {
      return res.status(400).json({
        error: 'Geçerli bir ogrenciId gönderilmelidir.',
      });
    }

    const result = await bysService.getStudentCourses(studentId);

    res.status(200).json(result);
  } catch (error) {
    console.error('BYS ders listesi hatası:', error.message);
    res.status(502).json({
      error: 'BYS ders listesi alınamadı.',
    });
  }
});

router.get('/student-schedule', async (req, res) => {
  try {
    const studentId = Number(req.query.ogrenciId);

    if (!Number.isInteger(studentId) || studentId <= 0) {
      return res.status(400).json({
        error: 'Geçerli bir ogrenciId gönderilmelidir.',
      });
    }

    const result = await bysService.getStudentSchedule(studentId);

    res.status(200).json(result);
  } catch (error) {
    console.error('BYS ders programı hatası:', error.message);
    res.status(502).json({
      error: 'BYS ders programı alınamadı.',
    });
  }
});

module.exports = router;