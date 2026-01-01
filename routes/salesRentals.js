const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get SalesRental model from app locals
const getSalesRentalModel = (req) => req.app.locals.models.SalesRental;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/sales-rentals/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'sales-rental-' + uniqueSuffix + path.extname(file.originalname));
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

// Get all sales/rentals (public)
router.get('/', async (req, res) => {
    try {
        const { published, featured, type, category, available, limit } = req.query;
        const SalesRental = getSalesRentalModel(req);
        const where = {};
        
        if (published !== undefined) {
            where.published = published === 'true';
        }
        
        if (featured !== undefined) {
            where.featured = featured === 'true';
        }
        
        if (type && type !== 'all') {
            where.type = type;
        }
        
        if (category && category !== 'all') {
            where.category = category;
        }
        
        if (available === 'true') {
            where.availability = true;
        }
        
        const items = await SalesRental.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: limit ? parseInt(limit) : 100
        });
        
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single sales/rental (public)
router.get('/:id', async (req, res) => {
    try {
        const SalesRental = getSalesRentalModel(req);
        const item = await SalesRental.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create sales/rental (protected - admin only)
router.post('/', auth, adminOnly, upload.single('image'), [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('shortDescription').trim().notEmpty().withMessage('Short description is required'),
    body('type').isIn(['sale', 'rental']).withMessage('Type must be sale or rental')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { 
            title, 
            description, 
            shortDescription,
            type,
            category,
            price,
            priceDisplay,
            location,
            condition,
            contactEmail,
            contactPhone,
            availability,
            featured, 
            published
        } = req.body;
        
        const SalesRental = getSalesRentalModel(req);
        const image = req.file ? `/uploads/sales-rentals/${req.file.filename}` : '';

        const item = await SalesRental.create({
            title,
            description,
            shortDescription,
            type: type || 'sale',
            category: category || 'General',
            price: price ? parseFloat(price) : null,
            priceDisplay: priceDisplay || '',
            location: location || '',
            condition: condition || '',
            contactEmail: contactEmail || '',
            contactPhone: contactPhone || '',
            availability: availability !== undefined ? (availability === 'true' || availability === true) : true,
            featured: featured === 'true' || featured === true,
            published: published === 'true' || published === true,
            image
        });

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update sales/rental (protected - admin only)
router.put('/:id', auth, adminOnly, upload.single('image'), [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('shortDescription').trim().notEmpty().withMessage('Short description is required'),
    body('type').isIn(['sale', 'rental']).withMessage('Type must be sale or rental')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const SalesRental = getSalesRentalModel(req);
        const item = await SalesRental.findByPk(req.params.id);
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const { 
            title, 
            description, 
            shortDescription,
            type,
            category,
            price,
            priceDisplay,
            location,
            condition,
            contactEmail,
            contactPhone,
            availability,
            featured, 
            published
        } = req.body;

        // Update image only if a new file is uploaded
        const image = req.file ? `/uploads/sales-rentals/${req.file.filename}` : item.image;

        await item.update({
            title,
            description,
            shortDescription,
            type: type || item.type,
            category: category || item.category,
            price: price ? parseFloat(price) : item.price,
            priceDisplay: priceDisplay !== undefined ? priceDisplay : item.priceDisplay,
            location: location !== undefined ? location : item.location,
            condition: condition !== undefined ? condition : item.condition,
            contactEmail: contactEmail !== undefined ? contactEmail : item.contactEmail,
            contactPhone: contactPhone !== undefined ? contactPhone : item.contactPhone,
            availability: availability !== undefined ? (availability === 'true' || availability === true) : item.availability,
            featured: featured === 'true' || featured === true,
            published: published === 'true' || published === true,
            image
        });

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete sales/rental (protected - admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const SalesRental = getSalesRentalModel(req);
        const item = await SalesRental.findByPk(req.params.id);
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        await item.destroy();
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

