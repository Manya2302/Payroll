import { Profile, Document, Employee, User } from '../../shared/mongoose-schema.js';
import { uploadProfileImage, uploadDocument } from '../config/multer.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function setupUploadRoutes(app, requireAuth, requireAdmin) {
  
  app.post('/api/profile/upload-image', requireAuth, uploadProfileImage.single('profileImage'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const employeeId = req.body.employeeId;
      if (!employeeId) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Employee ID is required' });
      }

      const imageUrl = `/uploads/profile-images/${req.file.filename}`;

      const profile = await Profile.findOneAndUpdate(
        { employeeId },
        { profileImage: imageUrl },
        { new: true }
      );

      if (!profile) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Profile not found' });
      }

      res.json({ 
        message: 'Profile image uploaded successfully',
        profileImage: imageUrl,
        profile
      });
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Error uploading profile image:', error);
      res.status(500).json({ message: 'Error uploading profile image', error: error.message });
    }
  });

  app.post('/api/documents/upload', requireAuth, uploadDocument.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { documentType, documentName } = req.body;
      const userId = req.user.id;

      if (!documentType || !documentName) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Document type and name are required' });
      }

      const documentUrl = `/uploads/documents/${req.file.filename}`;

      const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
      
      if (skipDb) {
        return res.json({
          message: 'Document uploaded successfully (SKIP_DB mode)',
          document: {
            id: 'temp-' + Date.now(),
            documentType,
            documentName,
            documentUrl,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            uploadedAt: new Date()
          }
        });
      }

      const employeeId = req.user.employeeId ? new mongoose.Types.ObjectId(req.user.employeeId) : undefined;
      
      const document = new Document({
        userId: new mongoose.Types.ObjectId(userId),
        ...(employeeId && { employeeId }),
        documentType,
        documentName,
        documentUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      });

      await document.save();

      res.json({
        message: 'Document uploaded successfully',
        document: document.toObject()
      });
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Error uploading document:', error);
      res.status(500).json({ message: 'Error uploading document', error: error.message });
    }
  });

  app.get('/api/documents', requireAuth, async (req, res) => {
    try {
      const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
      
      if (skipDb) {
        return res.json({ documents: [] });
      }

      const userId = req.user.id;
      const documents = await Document.find({ userId }).sort({ uploadedAt: -1 });

      res.json({ documents });
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
  });

  app.delete('/api/documents/:id', requireAuth, async (req, res) => {
    try {
      const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
      
      if (skipDb) {
        return res.json({ message: 'Document deleted successfully (SKIP_DB mode)' });
      }

      const documentId = req.params.id;
      const userId = req.user.id;

      const document = await Document.findOne({ _id: documentId, userId });

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const filePathRelative = document.documentUrl.startsWith('/') ? document.documentUrl.slice(1) : document.documentUrl;
      const filePath = path.join(__dirname, '..', '..', filePathRelative);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await Document.deleteOne({ _id: documentId });

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ message: 'Error deleting document', error: error.message });
    }
  });

  app.get('/api/admin/documents', requireAdmin, async (req, res) => {
    try {
      const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
      
      if (skipDb) {
        return res.json({ documents: [] });
      }

      const documents = await Document.find()
        .populate('userId', 'username email')
        .populate('employeeId', 'firstName lastName employeeId department')
        .sort({ uploadedAt: -1 });

      const documentsWithEmployeeInfo = await Promise.all(documents.map(async (doc) => {
        const docObj = doc.toObject();
        
        if (!docObj.employeeId) {
          const employee = await Employee.findOne({ userId: docObj.userId._id });
          if (employee) {
            docObj.employeeInfo = {
              firstName: employee.firstName,
              lastName: employee.lastName,
              employeeId: employee.employeeId,
              department: employee.department
            };
          }
        } else {
          docObj.employeeInfo = {
            firstName: docObj.employeeId.firstName,
            lastName: docObj.employeeId.lastName,
            employeeId: docObj.employeeId.employeeId,
            department: docObj.employeeId.department
          };
        }
        
        return docObj;
      }));

      res.json({ documents: documentsWithEmployeeInfo });
    } catch (error) {
      console.error('Error fetching admin documents:', error);
      res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
  });

  app.put('/api/admin/documents/:id/verify', requireAdmin, async (req, res) => {
    try {
      const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
      
      if (skipDb) {
        return res.json({ message: 'Document verified successfully (SKIP_DB mode)' });
      }

      const documentId = req.params.id;
      const { verificationStatus, verificationNotes } = req.body;

      if (!['approved', 'rejected', 'pending'].includes(verificationStatus)) {
        return res.status(400).json({ message: 'Invalid verification status' });
      }

      const document = await Document.findByIdAndUpdate(
        documentId,
        {
          verificationStatus,
          verifiedBy: req.user.id,
          verificationDate: new Date(),
          verificationNotes: verificationNotes || ''
        },
        { new: true }
      );

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      res.json({ 
        message: 'Document verification status updated successfully',
        document: document.toObject()
      });
    } catch (error) {
      console.error('Error verifying document:', error);
      res.status(500).json({ message: 'Error verifying document', error: error.message });
    }
  });
}
