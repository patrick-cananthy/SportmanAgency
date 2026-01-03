const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check token expiration (30 minutes)
        const now = Date.now();
        const tokenIssuedAt = decoded.iat * 1000; // Convert to milliseconds
        if (now - tokenIssuedAt > SESSION_TIMEOUT) {
            return res.status(401).json({ message: 'Session expired. Please login again.' });
        }
        
        const User = req.app.locals.models.User;
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['password'] }
        });
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check last activity (30 minutes inactivity timeout)
        if (user.lastActivity) {
            const lastActivity = new Date(user.lastActivity).getTime();
            if (now - lastActivity > SESSION_TIMEOUT) {
                return res.status(401).json({ message: 'Session expired due to inactivity. Please login again.' });
            }
        }
        
        // Update last activity
        await user.update({ lastActivity: new Date() });

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired. Please login again.' });
        }
        res.status(401).json({ message: 'Invalid token' });
    }
};

const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Only 'admin' role is allowed (super_admin has been removed)
    if (req.user.role !== 'admin') {
        console.log(`[AUTH] Admin access denied for user ${req.user.id} (${req.user.username}). Role: ${req.user.role}`);
        return res.status(403).json({ 
            message: 'Admin access required. Your role: ' + req.user.role,
            userRole: req.user.role,
            userId: req.user.id
        });
    }
    next();
};

module.exports = { auth, adminOnly };

