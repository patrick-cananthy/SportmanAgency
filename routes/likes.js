const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();

// Get Like model from app locals
const getLikeModel = (req) => req.app.locals.models.Like;

// Get client IP address
const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           'unknown';
};

// Like an article (public)
router.post('/:newsId', async (req, res) => {
    try {
        const { newsId } = req.params;
        const Like = getLikeModel(req);
        const News = req.app.locals.models.News;
        
        // Check if article exists
        const news = await News.findByPk(newsId);
        if (!news) {
            return res.status(404).json({ message: 'Article not found' });
        }
        
        const userIp = getClientIp(req);
        const userAgent = req.headers['user-agent'] || '';
        
        // Check if already liked by this IP
        const existingLike = await Like.findOne({
            where: {
                newsId: newsId,
                userIp: userIp
            }
        });
        
        if (existingLike) {
            // Unlike - remove the like
            await existingLike.destroy();
            return res.json({ 
                liked: false, 
                message: 'Article unliked',
                count: await Like.count({ where: { newsId } })
            });
        }
        
        // Create new like
        const like = await Like.create({
            newsId: newsId,
            userIp: userIp,
            userAgent: userAgent
        });
        
        const likeCount = await Like.count({ where: { newsId } });
        
        res.json({ 
            liked: true, 
            message: 'Article liked',
            count: likeCount
        });
    } catch (error) {
        console.error('Like error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Check if article is liked by current IP (public)
router.get('/:newsId/status', async (req, res) => {
    try {
        const { newsId } = req.params;
        const Like = getLikeModel(req);
        const userIp = getClientIp(req);
        
        const like = await Like.findOne({
            where: {
                newsId: newsId,
                userIp: userIp
            }
        });
        
        const likeCount = await Like.count({ where: { newsId } });
        
        res.json({ 
            liked: !!like,
            count: likeCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get like count for an article (public)
router.get('/:newsId/count', async (req, res) => {
    try {
        const { newsId } = req.params;
        const Like = getLikeModel(req);
        
        const count = await Like.count({ where: { newsId } });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

