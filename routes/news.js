const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get News model from app locals
const getNewsModel = (req) => req.app.locals.models.News;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/news/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'news-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Get all news (public)
router.get('/', async (req, res) => {
    try {
        const { published, featured, limit } = req.query;
        const News = getNewsModel(req);
        const where = {};
        
        if (published !== undefined) {
            where.published = published === 'true';
        }
        
        if (featured !== undefined) {
            where.featured = featured === 'true';
        }
        
        const news = await News.findAll({
            where,
            order: [['publishDate', 'DESC']],
            limit: limit ? parseInt(limit) : 100
        });
        
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single news item (public)
router.get('/:id', async (req, res) => {
    try {
        const News = getNewsModel(req);
        const news = await News.findByPk(req.params.id);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create news (protected)
router.post('/', auth, upload.single('image'), [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('excerpt').trim().notEmpty().withMessage('Excerpt is required'),
    body('author').trim().notEmpty().withMessage('Author is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, content, excerpt, author, category, featured, published } = req.body;
        const News = getNewsModel(req);
        
        if (!News) {
            console.error('[NEWS POST] News model is undefined!');
            return res.status(500).json({ message: 'Server error: Model not initialized' });
        }
        
        const image = req.file ? `/uploads/news/${req.file.filename}` : '';

        const news = await News.create({
            title,
            content,
            excerpt,
            author,
            category: category || 'General',
            featured: featured === 'true' || featured === true,
            published: published === 'true' || published === true,
            image
        });

        res.status(201).json(news);
    } catch (error) {
        console.error('[NEWS POST] Error:', error);
        console.error('[NEWS POST] Stack:', error.stack);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Update news (protected)
router.put('/:id', auth, upload.single('image'), [
    body('title').optional().trim().notEmpty(),
    body('content').optional().notEmpty(),
    body('excerpt').optional().trim().notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const News = getNewsModel(req);
        const news = await News.findByPk(req.params.id);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }

        const { title, content, excerpt, author, category, featured, published } = req.body;
        
        const updateData = {};
        if (title) updateData.title = title;
        if (content) updateData.content = content;
        if (excerpt) updateData.excerpt = excerpt;
        if (author) updateData.author = author;
        if (category) updateData.category = category;
        if (featured !== undefined) updateData.featured = featured === 'true' || featured === true;
        if (published !== undefined) updateData.published = published === 'true' || published === true;
        if (req.file) updateData.image = `/uploads/news/${req.file.filename}`;

        await news.update(updateData);
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete news (protected - admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const News = getNewsModel(req);
        const news = await News.findByPk(req.params.id);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }
        await news.destroy();
        res.json({ message: 'News deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

