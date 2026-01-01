const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get Talent model from app locals
const getTalentModel = (req) => req.app.locals.models.Talent;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/talents/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'talent-' + uniqueSuffix + path.extname(file.originalname));
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

// Get all talents (public)
router.get('/', async (req, res) => {
    try {
        const { published, featured, sport, limit } = req.query;
        const Talent = getTalentModel(req);
        const where = {};
        
        if (published !== undefined) {
            where.published = published === 'true';
        }
        
        if (featured !== undefined) {
            where.featured = featured === 'true';
        }
        
        if (sport && sport !== 'all') {
            where.sport = sport;
        }
        
        const talents = await Talent.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: limit ? parseInt(limit) : 100
        });
        
        res.json(talents);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single talent (public)
router.get('/:id', async (req, res) => {
    try {
        const Talent = getTalentModel(req);
        const talent = await Talent.findByPk(req.params.id);
        if (!talent) {
            return res.status(404).json({ message: 'Talent not found' });
        }
        res.json(talent);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create talent (protected - admin only)
router.post('/', auth, adminOnly, upload.single('image'), [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('sport').trim().notEmpty().withMessage('Sport is required'),
    body('bio').notEmpty().withMessage('Bio is required'),
    body('shortBio').trim().notEmpty().withMessage('Short bio is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { 
            name, 
            sport, 
            bio, 
            shortBio,
            achievements,
            nationality,
            age,
            position,
            team,
            stats,
            socialMedia,
            featured, 
            published
        } = req.body;
        
        const Talent = getTalentModel(req);
        const image = req.file ? `/uploads/talents/${req.file.filename}` : '';

        const talent = await Talent.create({
            name,
            sport,
            bio,
            shortBio,
            achievements: achievements || '',
            nationality: nationality || '',
            age: age ? parseInt(age) : null,
            position: position || '',
            team: team || '',
            stats: stats || '',
            socialMedia: socialMedia || '',
            featured: featured === 'true' || featured === true,
            published: published === 'true' || published === true,
            image
        });

        res.status(201).json(talent);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update talent (protected - admin only)
router.put('/:id', auth, adminOnly, upload.single('image'), [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('sport').trim().notEmpty().withMessage('Sport is required'),
    body('bio').notEmpty().withMessage('Bio is required'),
    body('shortBio').trim().notEmpty().withMessage('Short bio is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const Talent = getTalentModel(req);
        const talent = await Talent.findByPk(req.params.id);
        
        if (!talent) {
            return res.status(404).json({ message: 'Talent not found' });
        }

        const { 
            name, 
            sport, 
            bio, 
            shortBio,
            achievements,
            nationality,
            age,
            position,
            team,
            stats,
            socialMedia,
            featured, 
            published
        } = req.body;

        // Update image only if a new file is uploaded
        const image = req.file ? `/uploads/talents/${req.file.filename}` : talent.image;

        await talent.update({
            name,
            sport,
            bio,
            shortBio,
            achievements: achievements !== undefined ? achievements : talent.achievements,
            nationality: nationality !== undefined ? nationality : talent.nationality,
            age: age ? parseInt(age) : talent.age,
            position: position !== undefined ? position : talent.position,
            team: team !== undefined ? team : talent.team,
            stats: stats !== undefined ? stats : talent.stats,
            socialMedia: socialMedia !== undefined ? socialMedia : talent.socialMedia,
            featured: featured === 'true' || featured === true,
            published: published === 'true' || published === true,
            image
        });

        res.json(talent);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete talent (protected - admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const Talent = getTalentModel(req);
        const talent = await Talent.findByPk(req.params.id);
        
        if (!talent) {
            return res.status(404).json({ message: 'Talent not found' });
        }

        await talent.destroy();
        res.json({ message: 'Talent deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

