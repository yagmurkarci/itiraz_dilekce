const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.saveAttachment = async ({ requestId, uploadedBy, file }) => {
  if (!file) throw new Error('File is required');
  if (!requestId) throw new Error('Request id is required');
  if (!file.mimetype.startsWith('image/') && file.mimetype !== 'application/pdf') {
    throw new Error('Only image and PDF files are accepted');
  }

  const request = await prisma.request.findUnique({ where: { id: Number(requestId) } });
  if (!request) throw new Error('Request not found');
  const isOwner = request.createdBy === Number(uploadedBy);
  const isAssignedInstructor = request.assignedTo === Number(uploadedBy) && request.status === 'IN_REVIEW';
  if (!isOwner && !isAssignedInstructor) throw new Error('You cannot attach a file to this request');

  const uploadDir = path.join(__dirname, '../../../uploads/requests');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = path.join(uploadDir, safeName);

  fs.writeFileSync(filePath, file.buffer);

  return prisma.requestAttachment.create({
    data: {
      requestId: Number(requestId),
      uploadedBy: Number(uploadedBy),
      filePath: `/uploads/requests/${safeName}`,
      fileName: file.originalname,
      mimeType: file.mimetype,
    },
  });
};

exports.getRequestAttachments = async (requestId) => {
  return prisma.requestAttachment.findMany({
    where: { requestId: Number(requestId) },
    orderBy: { createdAt: 'desc' },
  });
};
