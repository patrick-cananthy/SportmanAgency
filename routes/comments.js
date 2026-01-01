const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');

// Get Comment model from app locals
const getCommentModel = (req) => req.app.locals.models.Comment;

// Get client IP address
const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           'unknown';
};

// Get all comments for an article (public - only approved)
router.get('/news/:newsId', async (req, res) => {
    try {
        const { newsId } = req.params;
        const Comment = getCommentModel(req);
        const News = req.app.locals.models.News;
        
        if (!Comment || !News) {
            console.error('Models not available:', { Comment: !!Comment, News: !!News });
            return res.status(500).json({ message: 'Server configuration error' });
        }
        
        // Check if article exists
        const news = await News.findByPk(newsId);
        if (!news) {
            return res.status(404).json({ message: 'Article not found' });
        }
        
        const comments = await Comment.findAll({
            where: {
                newsId: parseInt(newsId),
                approved: true
            },
            order: [['createdAt', 'DESC']]
        });
        
        res.json(comments || []);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a comment (public)
router.post('/news/:newsId', [
    body('authorName').trim().notEmpty().withMessage('Name is required').isLength({ min: 1, max: 100 }),
    body('authorEmail').trim().isEmail().withMessage('Valid email is required'),
    body('content').trim().notEmpty().withMessage('Comment content is required').isLength({ min: 1, max: 2000 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { newsId } = req.params;
        const { authorName, authorEmail, content } = req.body;
        const Comment = getCommentModel(req);
        const News = req.app.locals.models.News;
        
        // Check if article exists
        const news = await News.findByPk(newsId);
        if (!news) {
            return res.status(404).json({ message: 'Article not found' });
        }
        
        const userIp = getClientIp(req);
        const userAgent = req.headers['user-agent'] || '';
        
        const comment = await Comment.create({
            newsId: newsId,
            authorName: authorName.trim(),
            authorEmail: authorEmail.trim(),
            content: content.trim(),
            approved: false, // Comments require approval
            userIp: userIp,
            userAgent: userAgent
        });
        
        res.status(201).json({
            message: 'Comment submitted successfully. It will be reviewed before being published.',
            comment: comment
        });
    } catch (error) {
        console.error('Comment creation error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all comments (admin only - includes unapproved)
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const Comment = getCommentModel(req);
        const { newsId, approved, limit } = req.query;
        
        const where = {};
        if (newsId) where.newsId = newsId;
        if (approved !== undefined) where.approved = approved === 'true';
        
        const options = {
            where,
            order: [['createdAt', 'DESC']]
        };
        
        if (limit) {
            options.limit = parseInt(limit);
        }
        
        const comments = await Comment.findAll(options);
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Approve/Reject comment (admin only)
router.put('/:id/approve', auth, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { approved } = req.body;
        const Comment = getCommentModel(req);
        
        const comment = await Comment.findByPk(id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        comment.approved = approved === true || approved === 'true';
        await comment.save();
        
        res.json({ message: `Comment ${comment.approved ? 'approved' : 'rejected'}`, comment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete comment (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const Comment = getCommentModel(req);
        
        const comment = await Comment.findByPk(id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        await comment.destroy();
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

