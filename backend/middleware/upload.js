import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../storage/uploads');
console.log('Uploads directory path:', uploadsDir);

if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created successfully');
} else {
    console.log('Uploads directory already exists');
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `product-${uniqueSuffix}${extension}`);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter
});

// Upload single image with logging
export const uploadSingle = (req, res, next) => {
    console.log('[UPLOAD MIDDLEWARE] Processing single image upload...');
    console.log('[UPLOAD MIDDLEWARE] Content-Type:', req.get('Content-Type'));

    const uploadHandler = upload.single('image');
    uploadHandler(req, res, (err) => {
        if (err) {
            console.log('[UPLOAD MIDDLEWARE] Upload error:', err.message);
            return next(err);
        }

        console.log('[UPLOAD MIDDLEWARE] Upload successful');
        console.log('[UPLOAD MIDDLEWARE] File received:', req.file ? 'YES' : 'NO');
        if (req.file) {
            console.log('[UPLOAD MIDDLEWARE] File details:', {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                filename: req.file.filename,
                size: req.file.size
            });
        }
        next();
    });
};

// Upload multiple images with logging
export const uploadMultiple = (req, res, next) => {
    console.log('[UPLOAD MIDDLEWARE] Processing multiple images upload...');

    const uploadHandler = upload.array('images', 5);
    uploadHandler(req, res, (err) => {
        if (err) {
            console.log('[UPLOAD MIDDLEWARE] Upload error:', err.message);
            return next(err);
        }

        console.log('[UPLOAD MIDDLEWARE] Upload successful');
        console.log('[UPLOAD MIDDLEWARE] Files received:', req.files ? req.files.length : 0);
        next();
    });
};

// Error handler for multer errors
export const handleUploadError = (error, req, res, next) => {
    console.log('[UPLOAD ERROR HANDLER] Error occurred:', error);

    if (error instanceof multer.MulterError) {
        console.log('[UPLOAD ERROR HANDLER] Multer error code:', error.code);

        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum is 5 images'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field. Expected field name: image'
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${error.message}`
        });
    }

    if (error.message === 'Only image files are allowed') {
        return res.status(400).json({
            success: false,
            message: 'Only image files are allowed'
        });
    }

    console.log('[UPLOAD ERROR HANDLER] Passing error to next handler');
    next(error);
};

export default upload; 