const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();

// This route can be extended for managing other content types
// For now, it's a placeholder for future content management features

router.get('/stats', auth, async (req, res) => {
    try {
        const { News, User, Like, Comment } = req.app.locals.models;
        
        const totalNews = await News.count();
        const publishedNews = await News.count({ where: { published: true } });
        const featuredNews = await News.count({ where: { featured: true } });
        const totalUsers = await User.count();
        const totalLikes = await Like.count();
        const totalComments = await Comment.count();
        const pendingComments = await Comment.count({ where: { approved: false } });
        
        res.json({
            news: {
                total: totalNews,
                published: publishedNews,
                featured: featuredNews,
                draft: totalNews - publishedNews
            },
            users: {
                total: totalUsers
            },
            likes: totalLikes,
            comments: {
                total: totalComments,
                pending: pendingComments,
                approved: totalComments - pendingComments
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

