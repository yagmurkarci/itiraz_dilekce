const express = require('express');
const router = express.Router();

const courseService = require('../services/courses.service');
const verifyToken = require('../middleware/authMiddleware');
const dynamicAuthorize = require('../middleware/dynamic-authorize');

router.use(verifyToken);

router.get('/GetAllCourses', dynamicAuthorize, async (req, res) => {
  try {
    const courses = await courseService.getAllCourses();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/GetCourseById/:id', dynamicAuthorize, async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    res.status(200).json(course);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/GetDepartmentCourseMap', dynamicAuthorize, async (req, res) => {
  try {
    const map = await courseService.getDepartmentCourseMap();
    res.status(200).json(map);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/CreateCourse', dynamicAuthorize, async (req, res) => {
  try {
    const { courseCode, courseName, departmentId, departmentIds } = req.body;

    const course = await courseService.createCourse(
      courseCode,
      courseName,
      departmentId,
      departmentIds || []
    );

    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/UpdateCourseById/:id', dynamicAuthorize, async (req, res) => {
  try {
    const { courseCode, courseName, departmentId } = req.body;

    const course = await courseService.updateCourse(
      req.params.id,
      courseCode,
      courseName,
      departmentId
    );

    res.status(200).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/DeleteCourseById/:id', dynamicAuthorize, async (req, res) => {
  try {
    const course = await courseService.deleteCourse(req.params.id);
    res.status(200).json(course);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;