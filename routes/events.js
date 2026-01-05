const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get Event model from app locals
const getEventModel = (req) => req.app.locals.models.Event;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/events/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
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

// Get all events (public)
router.get('/', async (req, res) => {
    try {
        const { published, featured, upcoming, limit } = req.query;
        const Event = getEventModel(req);
        const where = {};
        
        if (published !== undefined) {
            where.published = published === 'true';
        }
        
        if (featured !== undefined) {
            where.featured = featured === 'true';
        }
        
        // Filter for upcoming events (eventDate >= today)
        if (upcoming === 'true') {
            where.eventDate = {
                [Op.gte]: new Date()
            };
        }
        
        const events = await Event.findAll({
            where,
            order: [['eventDate', 'ASC']],
            limit: limit ? parseInt(limit) : 100
        });
        
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single event (public)
router.get('/:id', async (req, res) => {
    try {
        const Event = getEventModel(req);
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create event (protected - admin only)
router.post('/', auth, adminOnly, upload.single('image'), [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('shortDescription').trim().notEmpty().withMessage('Short description is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('eventDate').notEmpty().withMessage('Event date is required')
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
            location, 
            eventDate, 
            eventTime,
            category, 
            featured, 
            published,
            registrationUrl,
            contactEmail,
            contactPhone
        } = req.body;
        
        const Event = getEventModel(req);
        const image = req.file ? `/uploads/events/${req.file.filename}` : '';

        const event = await Event.create({
            title,
            description,
            shortDescription,
            location,
            eventDate,
            eventTime: eventTime || '',
            category: category || 'General',
            featured: featured === 'true' || featured === true,
            published: published === 'true' || published === true,
            image,
            registrationUrl: registrationUrl || '',
            contactEmail: contactEmail || '',
            contactPhone: contactPhone || ''
        });

        res.status(201).json(event);
    } catch (error) {
        console.error('[EVENT POST] Error:', error);
        console.error('[EVENT POST] Stack:', error.stack);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Update event (protected - admin only)
router.put('/:id', auth, adminOnly, upload.single('image'), [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('shortDescription').trim().notEmpty().withMessage('Short description is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('eventDate').notEmpty().withMessage('Event date is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const Event = getEventModel(req);
        const event = await Event.findByPk(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const { 
            title, 
            description, 
            shortDescription, 
            location, 
            eventDate, 
            eventTime,
            category, 
            featured, 
            published,
            registrationUrl,
            contactEmail,
            contactPhone
        } = req.body;

        // Update image only if a new file is uploaded
        const image = req.file ? `/uploads/events/${req.file.filename}` : event.image;

        await event.update({
            title,
            description,
            shortDescription,
            location,
            eventDate,
            eventTime: eventTime || event.eventTime,
            category: category || 'General',
            featured: featured === 'true' || featured === true,
            published: published === 'true' || published === true,
            image,
            registrationUrl: registrationUrl || event.registrationUrl,
            contactEmail: contactEmail || event.contactEmail,
            contactPhone: contactPhone || event.contactPhone
        });

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete event (protected - admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const Event = getEventModel(req);
        const event = await Event.findByPk(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        await event.destroy();
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

