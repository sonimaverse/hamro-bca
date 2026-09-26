import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { db } from '../services/dbStore.js';
import fs from 'fs';
import path from 'path';
import express from 'express';

export const uploadRouter = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for disk storage (when Cloudinary not configured) or memory storage
const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

const storage = useCloudinary
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: uploadsDir,
      filename: (_req, file, cb) => {
        const uniqueName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        cb(null, uniqueName);
      },
    });

const allowedMimes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Word (DOC/DOCX), PowerPoint (PPT/PPTX), and Images (JPG/PNG/WEBP) are supported.'));
    }
  },
});

uploadRouter.post(
  '/',
  authenticateToken,
  (req: Request, res: Response, next: any) => {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'File upload validation failed' });
      }
      next();
    });
  },
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded.' });
        return;
      }

      const file = req.file;
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      // Check if Cloudinary is configured
      if (cloudName && apiKey && apiSecret) {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        });

        // Upload buffer to Cloudinary
        const result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: 'hamro_bca_resources',
              public_id: `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        res.json({
          success: true,
          url: result.secure_url,
          fileName: file.originalname,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          provider: 'cloudinary',
        });
        return;
      }

      // If Cloudinary is not yet configured, serve file locally
      let fileUrl: string;
      // For all files (PDFs, images, etc.), return the local file URL
      // The frontend handles display appropriately (image preview for images, download link for PDFs)
      fileUrl = `/api/upload/files/${file.filename}`;

      res.json({
        success: true,
        url: fileUrl,
        fileName: file.originalname,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        provider: 'local-disk',
        notice: 'Uploaded successfully. Configure CLOUDINARY_CLOUD_NAME in .env.local for permanent multi-region CDN storage.',
      });
    } catch (err: any) {
      console.error('File upload error:', err);
      res.status(500).json({ error: err.message || 'File upload failed' });
    }
  }
);

// Serve uploaded files locally when Cloudinary is not configured
if (!useCloudinary) {
  /**
   * Guards the static file mount. A premium resource's stored fileUrl points at
   * this mount, so without this check the direct URL would bypass the
   * /api/resources authorization entirely.
   */
  uploadRouter.use(
    '/files',
    optionalAuth,
    async (req: Request, res: Response, next: express.NextFunction) => {
      try {
        const filename = path.basename(decodeURIComponent(req.path));
        if (!filename) {
          next();
          return;
        }

        const storedUrl = `/api/upload/files/${filename}`;
        const owner = await db.findResourceByFileUrl(storedUrl);

        if (owner?.isPremiumContent) {
          const entitled =
            req.user?.isPremium === true ||
            req.user?.role === 'admin' ||
            (owner.uploadedBy && req.user && owner.uploadedBy.toString() === req.user.id);

          if (!entitled) {
            res.status(403).json({ message: 'Premium subscription required' });
            return;
          }
        }

        next();
      } catch (err) {
        next();
      }
    },
    express.static(uploadsDir)
  );
}

/**
 * Cleans up a remote asset from Cloudinary if Cloudinary credentials are configured
 * and the URL belongs to the application's Cloudinary storage.
 */
export async function deleteUploadedAsset(fileUrl: string): Promise<boolean> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret || !fileUrl) {
    return false;
  }

  try {
    if (!fileUrl.includes('cloudinary.com')) {
      return false;
    }

    // Cloudinary URL structure: https://res.cloudinary.com/<cloud_name>/<resource_type>/upload/<version>/<public_id>.<format>
    const match = fileUrl.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    if (match && match[1]) {
      const publicId = match[1];
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      const res = await cloudinary.uploader.destroy(publicId);
      return res?.result === 'ok';
    }
  } catch (err: any) {
    console.error('Failed to cleanup Cloudinary asset:', err.message);
  }
  return false;
}

