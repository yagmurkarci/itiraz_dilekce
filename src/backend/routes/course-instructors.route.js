const express = require('express');
const router = express.Router();
const service = require('../services/course-instructors.service');
const verifyToken = require('../middleware/authMiddleware');
const dynamicAuthorize = require('../middleware/dynamic-authorize');

router.use(verifyToken);

const requireManager = (req, res, next) => {
	const roles = req.user.roles?.map(({ roleName }) => roleName) || [];
	if (!roles.some((role) => ['Root', 'Admin'].includes(role))) {
		return res.status(403).json({ error: 'Only administrators can manage course instructors' });
	}
	next();
};

router.get('/GetAssignments', dynamicAuthorize, requireManager, async (req, res) => {
	try {
		res.status(200).json(await service.getAssignments());
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.post('/AssignInstructor', dynamicAuthorize, requireManager, async (req, res) => {
	try {
		const assignment = await service.assignInstructor(req.body.courseId, req.body.instructorId);
		res.status(201).json(assignment);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

router.delete('/DeleteAssignment/:id', dynamicAuthorize, requireManager, async (req, res) => {
	try {
		res.status(200).json(await service.removeAssignment(req.params.id));
	} catch (error) {
		res.status(404).json({ error: error.message });
	}
});

router.post('/SyncFromBys', dynamicAuthorize, requireManager, async (req, res) => {
	try {
		res.status(200).json(await service.syncFromBys({ ogrenciId: req.body.ogrenciId }));
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

module.exports = router;
