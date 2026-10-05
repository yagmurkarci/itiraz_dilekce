const express = require('express');
const multer = require('multer');
const router = express.Router();
const requestAttachmentService = require('../services/request-attachments.service');
const verifyToken = require('../middleware/authMiddleware');
const dynamicAuthorize = require('../middleware/dynamic-authorize');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(verifyToken);

router.post('/UploadRequestAttachment', dynamicAuthorize, upload.single('file'), async (req, res) => {
  try {
    const attachment = await requestAttachmentService.saveAttachment({
      requestId: req.body.requestId,
      uploadedBy: req.user.userId,
      file: req.file,
    });
    res.status(201).json(attachment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/GetRequestAttachments/:requestId', dynamicAuthorize, async (req, res) => {
  try {
    const attachments = await requestAttachmentService.getRequestAttachments(req.params.requestId);
    res.status(200).json(attachments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
