const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get Service model from app locals
const getServiceModel = (req) => req.app.locals.models.Service;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/services/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'service-' + uniqueSuffix + path.extname(file.originalname));
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

// Helper function to generate slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Get all services (public)
router.get('/', async (req, res) => {
    try {
        const { published, featured, slug, limit } = req.query;
        const Service = getServiceModel(req);
        const where = {};
        
        if (published !== undefined) {
            where.published = published === 'true';
        }
        
        if (featured !== undefined) {
            where.featured = featured === 'true';
        }
        
        if (slug) {
            where.slug = slug;
        }
        
        const services = await Service.findAll({
            where,
            order: [['order', 'ASC'], ['createdAt', 'DESC']],
            limit: limit ? parseInt(limit) : 100
        });
        
        // Parse features for each service
        const servicesWithFeatures = services.map(service => {
            const serviceData = service.toJSON();
            if (serviceData.features && typeof serviceData.features === 'string') {
                try {
                    serviceData.features = JSON.parse(serviceData.features);
                } catch {
                    serviceData.features = serviceData.features.split('\n').filter(f => f.trim());
                }
            }
            return serviceData;
        });
        
        res.json(servicesWithFeatures);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single service (public)
router.get('/:id', async (req, res) => {
    try {
        const Service = getServiceModel(req);
        const service = await Service.findByPk(req.params.id);
        
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        
        const serviceData = service.toJSON();
        if (serviceData.features && typeof serviceData.features === 'string') {
            try {
                serviceData.features = JSON.parse(serviceData.features);
            } catch {
                serviceData.features = serviceData.features.split('\n').filter(f => f.trim());
            }
        }
        
        res.json(serviceData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create service (protected - admin only)
router.post('/', auth, adminOnly, upload.single('image'), [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('shortDescription').trim().notEmpty().withMessage('Short description is required')
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
            features,
            icon,
            order,
            featured, 
            published,
            slug
        } = req.body;
        
        const Service = getServiceModel(req);
        const image = req.file ? `/uploads/services/${req.file.filename}` : '';
        
        // Generate slug if not provided
        const serviceSlug = slug || generateSlug(title);
        
        // Handle features - can be array or newline-separated string
        let featuresData = '';
        if (features) {
            if (Array.isArray(features)) {
                featuresData = JSON.stringify(features);
            } else {
                featuresData = features;
            }
        }

        const service = await Service.create({
            title,
            description,
            shortDescription,
            slug: serviceSlug,
            features: featuresData,
            icon: icon || '',
            order: order ? parseInt(order) : 0,
            featured: featured === 'true' || featured === true,
            published: published === 'true' || published === true,
            image
        });

        const serviceData = service.toJSON();
        if (serviceData.features && typeof serviceData.features === 'string') {
            try {
                serviceData.features = JSON.parse(serviceData.features);
            } catch {
                serviceData.features = serviceData.features.split('\n').filter(f => f.trim());
            }
        }

        res.status(201).json(serviceData);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ message: 'A service with this slug already exists' });
        } else {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
});

// Update service (protected - admin only)
router.put('/:id', auth, adminOnly, upload.single('image'), [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('shortDescription').trim().notEmpty().withMessage('Short description is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const Service = getServiceModel(req);
        const service = await Service.findByPk(req.params.id);
        
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const { 
            title, 
            description, 
            shortDescription,
            features,
            icon,
            order,
            featured, 
            published,
            slug
        } = req.body;
        
        // Handle image - only update if new file uploaded
        const updateData = {
            title,
            description,
            shortDescription,
            icon: icon || service.icon,
            order: order ? parseInt(order) : service.order,
            featured: featured === 'true' || featured === true,
            published: published === 'true' || published === true
        };
        
        if (req.file) {
            updateData.image = `/uploads/services/${req.file.filename}`;
        }
        
        if (slug) {
            updateData.slug = slug;
        } else if (title !== service.title) {
            // Regenerate slug if title changed
            updateData.slug = generateSlug(title);
        }
        
        // Handle features
        if (features !== undefined) {
            if (Array.isArray(features)) {
                updateData.features = JSON.stringify(features);
            } else {
                updateData.features = features;
            }
        }

        await service.update(updateData);
        
        const serviceData = service.toJSON();
        if (serviceData.features && typeof serviceData.features === 'string') {
            try {
                serviceData.features = JSON.parse(serviceData.features);
            } catch {
                serviceData.features = serviceData.features.split('\n').filter(f => f.trim());
            }
        }

        res.json(serviceData);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ message: 'A service with this slug already exists' });
        } else {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
});

// Delete service (protected - admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const Service = getServiceModel(req);
        const service = await Service.findByPk(req.params.id);
        
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        await service.destroy();
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

