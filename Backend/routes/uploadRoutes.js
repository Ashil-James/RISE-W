import express from 'express';
import upload from '../config/cloudinary.js';

const router = express.Router();

// POST /api/v1/upload
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Return the secure URL directly
        res.status(200).json({
            message: 'Image uploaded successfully',
            url: req.file.path // Cloudinary places the secure URL in req.file.path
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
});

export default router;
