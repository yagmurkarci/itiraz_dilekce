const express = require('express');
const router = express.Router();

const departmentService = require('../services/departments.service');
const verifyToken = require('../middleware/authMiddleware');
const dynamicAuthorize = require('../middleware/dynamic-authorize');

router.use(verifyToken);

router.get('/GetAllDepartments', dynamicAuthorize, async (req, res) => {
  try {
    const departments = await departmentService.getAllDepartments();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/GetDepartmentById/:id', dynamicAuthorize, async (req, res) => {
  try {
    const department = await departmentService.getDepartmentById(req.params.id);
    res.status(200).json(department);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/CreateDepartment', dynamicAuthorize, async (req, res) => {
  try {
    const department = await departmentService.createDepartment(
      req.body.departmentName
    );

    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/UpdateDepartmentById/:id', dynamicAuthorize, async (req, res) => {
  try {
    const department = await departmentService.updateDepartment(
      req.params.id,
      req.body.departmentName
    );

    res.status(200).json(department);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/DeleteDepartmentById/:id', dynamicAuthorize, async (req, res) => {
  try {
    const department = await departmentService.deleteDepartment(req.params.id);
    res.status(200).json(department);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;