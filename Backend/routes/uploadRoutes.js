import express from 'express';
import { upload } from '../middleware/multerMiddleware.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// POST /api/v1/upload
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Upload the locally saved file to Cloudinary
        const result = await uploadOnCloudinary(req.file.path);

        if (!result) {
            return res.status(500).json({ message: 'Cloudinary upload failed' });
        }

        res.status(200).json({
            message: 'Image uploaded successfully',
            url: result.secure_url
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
});

export default router;
