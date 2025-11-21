import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ROOT of project (Temp-Payroll)
const projectRoot = path.join(__dirname, '..');

// Uploads folder inside project
const uploadDir = path.join(projectRoot, 'uploads');
const profileImagesDir = path.join(uploadDir, 'profile-images');
const documentsDir = path.join(uploadDir, 'documents');

// Create folders if missing
[uploadDir, profileImagesDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Storage configs
const profileImageStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, profileImagesDir),
  filename: (_, file, cb) =>
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname))
});

const documentStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, documentsDir),
  filename: (_, file, cb) =>
    cb(null, 'doc-' + Date.now() + path.extname(file.originalname))
});

// File types
const fileFilter = (req, file, cb) => {
  const allowedImage = /jpeg|jpg|png|gif/;
  const allowedDocs = /jpeg|jpg|png|gif|pdf|doc|docx/;

  const isImage = file.fieldname === "profileImage";
  const allowed = isImage ? allowedImage : allowedDocs;

  if (
    allowed.test(path.extname(file.originalname).toLowerCase()) &&
    allowed.test(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"));
  }
};

export const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

export const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});
