const express = require('express');
const router = express.Router();
const requestService = require('../services/requests.service');
const verifyToken = require('../middleware/authMiddleware');
const dynamicAuthorize = require('../middleware/dynamic-authorize');

router.use(verifyToken);

router.get('/GetAllRequests', dynamicAuthorize, async (req, res) => {
  try {
    const roles = req.user.roles?.map(({ roleName }) => roleName) || [];
    if (!roles.some((role) => ['Root', 'Admin', 'Öğrenci İşleri'].includes(role))) {
      return res.status(403).json({ error: 'You cannot view the request queue' });
    }
    const requests = await requestService.getAllRequests();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/GetAssignedRequests', dynamicAuthorize, async (req, res) => {
  try {
    const isInstructor = req.user.roles?.some(({ roleName }) => ['Akademisyen', 'Öğretim Görevlisi'].includes(roleName));
    if (!isInstructor) return res.status(403).json({ error: 'Only academics can view assigned requests' });
    res.status(200).json(await requestService.getAssignedRequests(req.user.userId));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/GetRequestsByUser/:userId', dynamicAuthorize, async (req, res) => {
  try {
    const roles = req.user.roles?.map(({ roleName }) => roleName) || [];
    const isStudent = roles.some((roleName) => ['Öğrenci', 'Mezun'].includes(roleName));
    const canViewOtherUsers = roles.some((roleName) => ['Root', 'Admin', 'Öğrenci İşleri'].includes(roleName));
    if (!isStudent && !canViewOtherUsers) {
      return res.status(403).json({ error: 'You cannot view student requests' });
    }
    const requests = await requestService.getRequestsByUser(isStudent ? req.user.userId : req.params.userId);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/CreateRequest', dynamicAuthorize, async (req, res) => {
  try {
    const isStudent = req.user.roles?.some(({ roleName }) => ['Öğrenci', 'Mezun'].includes(roleName));
    if (!isStudent) {
      return res.status(403).json({ error: 'Only students and graduates can create requests' });
    }
    const request = await requestService.createRequest({ ...req.body, createdBy: req.user.userId });
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/UpdateRequest/:id', dynamicAuthorize, async (req, res) => {
  try {
    const isStudent = req.user.roles?.some(({ roleName }) => ['Öğrenci', 'Mezun'].includes(roleName));
    if (!isStudent) return res.status(403).json({ error: 'Only students can edit their requests' });
    const request = await requestService.updateRequestByStudent({
      requestId: req.params.id,
      userId: req.user.userId,
      ...req.body,
    });
    res.status(200).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/DeleteRequest/:id', dynamicAuthorize, async (req, res) => {
  try {
    const isStudent = req.user.roles?.some(({ roleName }) => ['Öğrenci', 'Mezun'].includes(roleName));
    if (!isStudent) return res.status(403).json({ error: 'Only students can delete their requests' });
    await requestService.deleteRequestByStudent({ requestId: req.params.id, userId: req.user.userId });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/ForwardRequest/:id', dynamicAuthorize, async (req, res) => {
  try {
    const canForward = req.user.roles?.some(({ roleName }) => ['Root', 'Admin', 'Öğrenci İşleri'].includes(roleName));
    if (!canForward) return res.status(403).json({ error: 'Only student affairs can forward requests' });
    const request = await requestService.forwardRequest({
      requestId: req.params.id,
      instructorId: req.body.instructorId,
    });
    res.status(200).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/RejectRequest/:id', dynamicAuthorize, async (req, res) => {
  try {
    const canReject = req.user.roles?.some(({ roleName }) => ['Root', 'Admin', 'Öğrenci İşleri'].includes(roleName));
    if (!canReject) return res.status(403).json({ error: 'Only student affairs can reject requests' });
    const request = await requestService.rejectRequest({
      requestId: req.params.id,
      rejectionReason: req.body.rejectionReason,
    });
    res.status(200).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/ReplyToRequest/:id', dynamicAuthorize, async (req, res) => {
  try {
    const isInstructor = req.user.roles?.some(({ roleName }) => ['Akademisyen', 'Öğretim Görevlisi'].includes(roleName));
    if (!isInstructor) return res.status(403).json({ error: 'Only academics can reply to assigned requests' });
    const request = await requestService.replyToRequest({
      requestId: req.params.id,
      instructorId: req.user.userId,
      answer: req.body.answer,
    });
    res.status(200).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/UpdateRequestStatus/:id', dynamicAuthorize, async (req, res) => {
  try {
    const isAdministrator = req.user.roles?.some(({ roleName }) => ['Root', 'Admin'].includes(roleName));
    if (!isAdministrator) return res.status(403).json({ error: 'Use the dedicated forward, reject, or reply action' });
    if (req.body.status === 'ANSWERED') {
      return res.status(400).json({ error: 'Only the assigned instructor can answer after uploading the exam paper' });
    }
    const request = await requestService.updateRequestStatus({
      requestId: req.params.id,
      ...req.body,
    });
    res.status(200).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
