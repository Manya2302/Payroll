// import { Profile, Document } from '../../shared/mongoose-schema.js';
// import { uploadProfileImage, uploadDocument } from '../config/multer.js';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';
// import mongoose from 'mongoose';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// export function setupUploadRoutes(app, requireAuth) {
  
//   app.post('/api/profile/upload-image', requireAuth, uploadProfileImage.single('profileImage'), async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ message: 'No file uploaded' });
//       }

//       const employeeId = req.body.employeeId;
//       if (!employeeId) {
//         fs.unlinkSync(req.file.path);
//         return res.status(400).json({ message: 'Employee ID is required' });
//       }

//       const imageUrl = `/uploads/profile-images/${req.file.filename}`;

//       const profile = await Profile.findOneAndUpdate(
//         { employeeId },
//         { profileImage: imageUrl },
//         { new: true }
//       );

//       if (!profile) {
//         fs.unlinkSync(req.file.path);
//         return res.status(404).json({ message: 'Profile not found' });
//       }

//       res.json({ 
//         message: 'Profile image uploaded successfully',
//         profileImage: imageUrl,
//         profile
//       });
//     } catch (error) {
//       if (req.file) {
//         fs.unlinkSync(req.file.path);
//       }
//       console.error('Error uploading profile image:', error);
//       res.status(500).json({ message: 'Error uploading profile image', error: error.message });
//     }
//   });

//   app.post('/api/documents/upload', requireAuth, uploadDocument.single('document'), async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ message: 'No file uploaded' });
//       }

//       const { documentType, documentName } = req.body;
//       const userId = req.user.id;

//       if (!documentType || !documentName) {
//         fs.unlinkSync(req.file.path);
//         return res.status(400).json({ message: 'Document type and name are required' });
//       }

//       const documentUrl = `/uploads/documents/${req.file.filename}`;

//       const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
      
//       if (skipDb) {
//         return res.json({
//           message: 'Document uploaded successfully (SKIP_DB mode)',
//           document: {
//             id: 'temp-' + Date.now(),
//             documentType,
//             documentName,
//             documentUrl,
//             fileSize: req.file.size,
//             mimeType: req.file.mimetype,
//             uploadedAt: new Date()
//           }
//         });
//       }

//       const employeeId = req.user.employeeId ? new mongoose.Types.ObjectId(req.user.employeeId) : undefined;
      
//       const document = new Document({
//         userId: new mongoose.Types.ObjectId(userId),
//         ...(employeeId && { employeeId }),
//         documentType,
//         documentName,
//         documentUrl,
//         fileSize: req.file.size,
//         mimeType: req.file.mimetype
//       });

//       await document.save();

//       res.json({
//         message: 'Document uploaded successfully',
//         document: document.toObject()
//       });
//     } catch (error) {
//       if (req.file) {
//         fs.unlinkSync(req.file.path);
//       }
//       console.error('Error uploading document:', error);
//       res.status(500).json({ message: 'Error uploading document', error: error.message });
//     }
//   });

//   app.get('/api/documents', requireAuth, async (req, res) => {
//     try {
//       const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
      
//       if (skipDb) {
//         return res.json({ documents: [] });
//       }

//       const userId = req.user.id;
//       const documents = await Document.find({ userId }).sort({ uploadedAt: -1 });

//       res.json({ documents });
//     } catch (error) {
//       console.error('Error fetching documents:', error);
//       res.status(500).json({ message: 'Error fetching documents', error: error.message });
//     }
//   });

//   app.delete('/api/documents/:id', requireAuth, async (req, res) => {
//     try {
//       const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
      
//       if (skipDb) {
//         return res.json({ message: 'Document deleted successfully (SKIP_DB mode)' });
//       }

//       const documentId = req.params.id;
//       const userId = req.user.id;

//       const document = await Document.findOne({ _id: documentId, userId });

//       if (!document) {
//         return res.status(404).json({ message: 'Document not found' });
//       }

//       const filePathRelative = document.documentUrl.startsWith('/') ? document.documentUrl.slice(1) : document.documentUrl;
//       const filePath = path.join(__dirname, '..', '..', filePathRelative);
//       if (fs.existsSync(filePath)) {
//         fs.unlinkSync(filePath);
//       }

//       await Document.deleteOne({ _id: documentId });

//       res.json({ message: 'Document deleted successfully' });
//     } catch (error) {
//       console.error('Error deleting document:', error);
//       res.status(500).json({ message: 'Error deleting document', error: error.message });
//     }
//   });
// }
import express from 'express';
import { Profile, Document , Employee , User} from '../../shared/mongoose-schema.js';
import { uploadProfileImage, uploadDocument } from '../config/multer.js';
import path from 'path';
import fs from 'fs';
import { requireAuth , requireAdmin } from '../routes.js';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function setupUploadRoutes(app) {
  // Serve uploads folder statically
  app.use('/uploads', requireAuth, express.static(path.join(__dirname, '..', '..', 'uploads')));

  // Upload profile image
  app.post('/api/profile/upload-image', requireAuth, uploadProfileImage.single('profileImage'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

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
      if (req.file) fs.unlinkSync(req.file.path);
      console.error('Error uploading profile image:', error);
      res.status(500).json({ message: 'Error uploading profile image', error: error.message });
    }
  });

//   // Upload document
//   app.post('/api/documents/upload', requireAuth, uploadDocument.single('document'), async (req, res) => {
//     try {
//       if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

//       const { documentType, documentName } = req.body;
//       const userId = req.user.id;

//       if (!documentType || !documentName) {
//         fs.unlinkSync(req.file.path);
//         return res.status(400).json({ message: 'Document type and name are required' });
//       }

//       const documentUrl = `/uploads/documents/${req.file.filename}`;

//       const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
//       if (skipDb) {
//         return res.json({
//           message: 'Document uploaded successfully (SKIP_DB mode)',
//           document: {
//             id: 'temp-' + Date.now(),
//             documentType,
//             documentName,
//             documentUrl,
//             fileSize: req.file.size,
//             mimeType: req.file.mimetype,
//             uploadedAt: new Date()
//           }
//         });
//       }

//       const employeeId = req.user.employeeId ? new mongoose.Types.ObjectId(req.user.employeeId) : undefined;

//       const document = new Document({
//         userId: new mongoose.Types.ObjectId(userId),
//         ...(employeeId && { employeeId }),
//         documentType,
//         documentName,
//         documentUrl,
//         fileSize: req.file.size,
//         mimeType: req.file.mimetype
//       });

//       await document.save();

//       res.json({
//         message: 'Document uploaded successfully',
//         document: document.toObject()
//       });
//     } catch (error) {
//       if (req.file) fs.unlinkSync(req.file.path);
//       console.error('Error uploading document:', error);
//       res.status(500).json({ message: 'Error uploading document', error: error.message });
//     }
//   });

//   // Fetch documents
//   app.get('/api/documents', requireAuth, async (req, res) => {
//     try {
//       const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
//       if (skipDb) return res.json({ documents: [] });

//       const userId = req.user.id;
//       const documents = await Document.find({ userId }).sort({ uploadedAt: -1 });

//       res.json({ documents });
//     } catch (error) {
//       console.error('Error fetching documents:', error);
//       res.status(500).json({ message: 'Error fetching documents', error: error.message });
//     }
//   });

//   // Delete document
//   app.delete('/api/documents/:id', requireAuth, async (req, res) => {
//     try {
//       const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
//       if (skipDb) return res.json({ message: 'Document deleted successfully (SKIP_DB mode)' });

//       const documentId = req.params.id;
//       const userId = req.user.id;

//       const document = await Document.findOne({ _id: documentId, userId });
//       if (!document) return res.status(404).json({ message: 'Document not found' });

//       const filePathRelative = document.documentUrl.startsWith('/') ? document.documentUrl.slice(1) : document.documentUrl;
//       const filePath = path.join(__dirname, '..', '..', filePathRelative);
//       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

//       await Document.deleteOne({ _id: documentId });

//       res.json({ message: 'Document deleted successfully' });
//     } catch (error) {
//       console.error('Error deleting document:', error);
//       res.status(500).json({ message: 'Error deleting document', error: error.message });
//     }
//   });
//   app.get('/api/admin/documents', requireAdmin, async (req, res) => {
//       try {
//         const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
        
//         if (skipDb) {
//           return res.json({ documents: [] });
//         }
  
//         const documents = await Document.find()
//           .populate('userId', 'username email')
//           .populate('employeeId', 'firstName lastName employeeId department')
//           .sort({ uploadedAt: -1 });
  
//         const documentsWithEmployeeInfo = await Promise.all(documents.map(async (doc) => {
//           const docObj = doc.toObject();
          
//           if (!docObj.employeeId) {
//             const employee = await Employee.findOne({ userId: docObj.userId });
//             if (employee) {
//               docObj.employeeInfo = {
//                 firstName: employee.firstName,
//                 lastName: employee.lastName,
//                 employeeId: employee.employeeId,
//                 department: employee.department
//               };
//             }
//           } else {
//             docObj.employeeInfo = {
//               firstName: docObj.employeeId.firstName,
//               lastName: docObj.employeeId.lastName,
//               employeeId: docObj.employeeId.employeeId,
//               department: docObj.employeeId.department
//             };
//           }
          
//           return docObj;
//         }));
  
//         res.json({ documents: documentsWithEmployeeInfo });
//       } catch (error) {
//         console.error('Error fetching admin documents:', error);
//         res.status(500).json({ message: 'Error fetching documents', error: error.message });
//       }
//     });
  
// //     // ADMIN: Verify / Approve / Reject Document
// // app.put('/api/admin/documents/:id/verify', requireAdmin, async (req, res) => {
// //   try {
// //     const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';

// //     if (skipDb) {
// //       return res.json({
// //         message: 'Document verified successfully (SKIP_DB mode)',
// //         document: {
// //           id: req.params.id,
// //           verificationStatus: req.body.verificationStatus,
// //           verificationNotes: req.body.verificationNotes || "",
// //           verifiedBy: "SKIP_DB",
// //           verificationDate: new Date()
// //         }
// //       });
// //     }

// //     const documentId = req.params.id;
// //     const { verificationStatus, verificationNotes } = req.body;

// //     // Validate verification status
// //     const allowedStatuses = ['approved', 'rejected', 'pending'];
// //     if (!allowedStatuses.includes(verificationStatus)) {
// //       return res.status(400).json({ message: "Invalid verification status" });
// //     }

// //     // Update the document
// //     const updatedDocument = await Document.findByIdAndUpdate(
// //       documentId,
// //       {
// //         verificationStatus,
// //         verificationNotes: verificationNotes || "",
// //         verifiedBy: req.user.id,
// //         verificationDate: new Date()
// //       },
// //       { new: true }
// //     )
// //     .populate('userId', 'username email')
// //     .populate('employeeId', 'firstName lastName employeeId department');

// //     if (!updatedDocument) {
// //       return res.status(404).json({ message: "Document not found" });
// //     }

// //     // Convert Mongoose document to plain object before sending
// //     const docObj = updatedDocument.toObject();

// //     res.json({
// //       message: "Document verification status updated successfully",
// //       document: docObj
// //     });

// //   } catch (error) {
// //     console.error("Error verifying document:", error);
// //     res.status(500).json({
// //       message: "Error verifying document",
// //       error: error.message
// //     });
// //   }
// // });
// app.put('/api/admin/documents/:id/verify', requireAdmin, async (req, res) => {
//   try {
//     const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
//     if (skipDb) {
//       return res.json({ message: 'Document verified successfully (SKIP_DB mode)' });
//     }

//     const documentId = req.params.id;
//     const { verificationStatus, verificationNotes } = req.body;

//     const allowedStatuses = ['approved', 'rejected', 'pending'];
//     if (!allowedStatuses.includes(verificationStatus.toLowerCase())) {
//       return res.status(400).json({ message: "Invalid verification status" });
//     }

//     const document = await Document.findById(documentId);
//     if (!document) return res.status(404).json({ message: "Document not found" });

//     // If REJECTED, delete file + DB row
//     if (verificationStatus === 'rejected') {

//       // Remove file
//       const filePath = path.join(__dirname, '..', '..', document.documentUrl.replace(/^\//, ''));
//       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

//       // Delete DB record
//       await Document.deleteOne({ _id: documentId });

//       return res.json({
//         message: "Document rejected and removed successfully",
//         deletedDocumentId: documentId
//       });
//     }

//     // If NOT rejected, simply update status
//     const updatedDocument = await Document.findByIdAndUpdate(
//       documentId,
//       {
//         verificationStatus,
//         verificationNotes: verificationNotes || "",
//         verifiedBy: req.user.id,
//         verificationDate: new Date()
//       },
//       { new: true }
//     )
//     .populate('userId', 'username email')
//     .populate('employeeId', 'firstName lastName employeeId department');

//     res.json({
//       message: "Document status updated successfully",
//       document: updatedDocument.toObject()
//     });

//   } catch (error) {
//     console.error("Error verifying document:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });
// api.get('/api/admin/documents-accepted', requireAdmin, async (req, res) => {
//   try {
//     const acceptedDocuments = await Document.find({ verificationStatus: 'approved' })
//       .populate('userId', 'username email')
//       .populate('employeeId', 'firstName lastName employeeId department')
//       .sort({ verificationDate: -1 });

//     res.json({ documents: acceptedDocuments });
//   } catch (error) {
//     console.error('Error fetching accepted documents:', error);
//     res.status(500).json({ message: 'Error fetching accepted documents', error: error.message });
//   }
// });
// api.get('/api/admin/documents-rejected',requireAdmin,async(req,res)=>{
//   try {
//     const rejectedDocuments=await Document.find({verificationStatus:'rejected'})
//       .populate('userId','username email')
//       .populate('employeeId','firstName lastName employeeId department')
//       .sort({verificationDate:-1});
//     res.json({documents:rejectedDocuments});
//   } catch (error) {
//     console.error('Error fetching rejected documents:',error);
//     res.status(500).json({message:'Error fetching rejected documents',error:error.message});
//   }
// });
// Upload document
app.post('/api/documents/upload', requireAuth, uploadDocument.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

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
          status: 'Pending',
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
      mimeType: req.file.mimetype,
      status: 'Pending' // default status
    });

    await document.save();

    res.json({
      message: 'Document uploaded successfully',
      document: document.toObject()
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
});

// Fetch documents for user
app.get('/api/documents', requireAuth, async (req, res) => {
  try {
    const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
    if (skipDb) return res.json({ documents: [] });

    const userId = req.user.id;
    const documents = await Document.find({ userId }).sort({ uploadedAt: -1 });

    res.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

// Delete document
app.delete('/api/documents/:id', requireAuth, async (req, res) => {
  try {
    const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
    if (skipDb) return res.json({ message: 'Document deleted successfully (SKIP_DB mode)' });

    const documentId = req.params.id;
    const userId = req.user.id;

    const document = await Document.findOne({ _id: documentId, userId });
    if (!document) return res.status(404).json({ message: 'Document not found' });

    const filePathRelative = document.documentUrl.startsWith('/') ? document.documentUrl.slice(1) : document.documentUrl;
    const filePath = path.join(__dirname, '..', '..', filePathRelative);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Document.deleteOne({ _id: documentId });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
});

// ADMIN: Fetch all documents
app.get('/api/admin/documents', requireAdmin, async (req, res) => {
  try {
    const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
    if (skipDb) return res.json({ documents: [] });

    const documents = await Document.find()
      .populate('userId', 'username email')
      .populate('employeeId', 'firstName lastName employeeId department')
      .sort({ uploadedAt: -1 });

    const documentsWithEmployeeInfo = await Promise.all(documents.map(async (doc) => {
      const docObj = doc.toObject();
      if (!docObj.employeeId) {
        const employee = await Employee.findOne({ userId: docObj.userId });
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

// ADMIN: Verify / Approve / Reject Document (SOFT DELETE VERSION)
app.put('/api/admin/documents/:id/verify', requireAdmin, async (req, res) => {
  try {
    const skipDb = (process.env.SKIP_DB || 'false').toLowerCase() === 'true';
    if (skipDb) return res.json({ message: 'Document verified successfully (SKIP_DB mode)' });

    const documentId = req.params.id;
    const { verificationStatus, verificationNotes } = req.body;

    const allowedStatuses = ['approved', 'rejected', 'pending'];
    if (!allowedStatuses.includes(verificationStatus))
      return res.status(400).json({ message: "Invalid verificationStatus" });

    const document = await Document.findById(documentId);
    if (!document) return res.status(404).json({ message: "Document not found" });

    // 🚨 SOFT DELETE RULE: DO NOT REMOVE FILE OR DOCUMENT
    // Just mark as rejected and update notes.

    const updatedDocument = await Document.findByIdAndUpdate(
      documentId,
      {
        verificationStatus,
        verificationNotes: verificationNotes || "",
        verifiedBy: req.user.id,
        verificationDate: new Date()
      },
      { new: true }
    )
    .populate('userId', 'username email')
    .populate('employeeId', 'firstName lastName employeeId department');

    return res.json({
      message: "Document verification status updated successfully",
      document: updatedDocument.toObject(),
    });

  } catch (error) {
    console.error("Error verifying document:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ADMIN: Fetch approved documents
app.get('/api/admin/documents-approved', requireAdmin, async (req, res) => {
  try {
    const documents = await Document.find({ verificationStatus: 'approved' })
      .populate('userId', 'username email')
      .populate('employeeId', 'firstName lastName employeeId department')
      .sort({ verificationDate: -1 });

    res.json({ documents });
  } catch (error) {
    console.error('Error fetching approved documents:', error);
    res.status(500).json({ message: 'Error fetching approved documents', error: error.message });
  }
});

// ADMIN: Fetch rejected documents
app.get('/api/admin/documents-rejected', requireAdmin, async (req, res) => {
  try {
    const documents = await Document.find({ verificationStatus: 'rejected' })
      .populate('userId', 'username email')
      .populate('employeeId', 'firstName lastName employeeId department')
      .sort({ verificationDate: -1 });

    res.json({ documents });
  } catch (error) {
    console.error('Error fetching rejected documents:', error);
    res.status(500).json({ message: 'Error fetching rejected documents', error: error.message });
  }
});
app.get('/api/documents/download/:id', requireAuth, async (req, res) => {
    try {
      const documentId = req.params.id;
      const userId = req.user.id;

      // 1. Find the document and verify ownership
      const document = await Document.findOne({ _id: documentId, userId });
      if (!document) {
        // Fallback for admin if they need to download a user's document
        // Or you can add specific logic here to check for admin privileges
        return res.status(404).json({ message: 'Document not found or access denied' });
      }

      const filePathRelative = document.documentUrl.startsWith('/') ? document.documentUrl.slice(1) : document.documentUrl;
      // Resolve the absolute path to the file
      const filePath = path.join(__dirname, '..', '..', filePathRelative);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found on server storage' });
      }

      // 2. Use res.download to force the file download prompt
      // The second argument sets the filename the user sees
      res.download(filePath, document.documentName + path.extname(filePath));

    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({ message: 'Error downloading document', error: error.message });
    }
  });
}
