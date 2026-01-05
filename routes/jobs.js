const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get Job model from app locals
const getJobModel = (req) => req.app.locals.models.Job;

// Get all jobs (public)
router.get('/', async (req, res) => {
    try {
        const { published, featured, open, limit } = req.query;
        const Job = getJobModel(req);
        const where = {};
        
        if (published !== undefined) {
            where.published = published === 'true';
        }
        
        if (featured !== undefined) {
            where.featured = featured === 'true';
        }
        
        // Filter for open positions (no closing date or closing date >= today)
        if (open === 'true') {
            where[Op.or] = [
                { closingDate: null },
                { closingDate: { [Op.gte]: new Date() } }
            ];
        }
        
        const jobs = await Job.findAll({
            where,
            order: [['postedDate', 'DESC']],
            limit: limit ? parseInt(limit) : 100
        });
        
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single job (public)
router.get('/:id', async (req, res) => {
    try {
        const Job = getJobModel(req);
        const job = await Job.findByPk(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create job (protected - admin only)
router.post('/', auth, adminOnly, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('shortDescription').trim().notEmpty().withMessage('Short description is required'),
    body('location').trim().notEmpty().withMessage('Location is required')
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
            jobType,
            department,
            requirements,
            salary,
            applicationUrl,
            contactEmail,
            featured, 
            published,
            closingDate
        } = req.body;
        
        const Job = getJobModel(req);

        const job = await Job.create({
            title,
            description,
            shortDescription,
            location,
            jobType: jobType || 'Full-time',
            department: department || 'General',
            requirements: requirements || '',
            salary: salary || '',
            applicationUrl: applicationUrl || '',
            contactEmail: contactEmail || '',
            featured: featured === 'true' || featured === true,
            published: published === 'true' || published === true,
            closingDate: closingDate || null
        });

        res.status(201).json(job);
    } catch (error) {
        console.error('[JOB POST] Error:', error);
        console.error('[JOB POST] Stack:', error.stack);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Update job (protected - admin only)
router.put('/:id', auth, adminOnly, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('shortDescription').trim().notEmpty().withMessage('Short description is required'),
    body('location').trim().notEmpty().withMessage('Location is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const Job = getJobModel(req);
        const job = await Job.findByPk(req.params.id);
        
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const { 
            title, 
            description, 
            shortDescription, 
            location, 
            jobType,
            department,
            requirements,
            salary,
            applicationUrl,
            contactEmail,
            featured, 
            published,
            closingDate
        } = req.body;

        await job.update({
            title,
            description,
            shortDescription,
            location,
            jobType: jobType || job.jobType,
            department: department || job.department,
            requirements: requirements !== undefined ? requirements : job.requirements,
            salary: salary !== undefined ? salary : job.salary,
            applicationUrl: applicationUrl !== undefined ? applicationUrl : job.applicationUrl,
            contactEmail: contactEmail !== undefined ? contactEmail : job.contactEmail,
            featured: featured === 'true' || featured === true,
            published: published === 'true' || published === true,
            closingDate: closingDate || job.closingDate
        });

        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete job (protected - admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const Job = getJobModel(req);
        const job = await Job.findByPk(req.params.id);
        
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        await job.destroy();
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

