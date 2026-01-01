const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Get User model from app locals
const getUserModel = (req) => req.app.locals.models.User;

// Register
router.post('/register', [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, role } = req.body;
        const User = getUserModel(req);

        // Check if user exists
        const existingUser = await User.findOne({ 
            where: { 
                [require('sequelize').Op.or]: [{ email }, { username }] 
            } 
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({ 
            username, 
            email, 
            password, 
            role: role || 'editor' 
        });

        // Update last activity
        await user.update({ lastActivity: new Date() });

        // Generate token with 30 minute expiration
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30m' });

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const User = getUserModel(req);

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last activity
        await user.update({ lastActivity: new Date() });

        // Generate token with 30 minute expiration
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30m' });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Verify token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const User = getUserModel(req);
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['password'] }
        });
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check last activity (30 minutes inactivity timeout)
        const now = Date.now();
        if (user.lastActivity) {
            const lastActivity = new Date(user.lastActivity).getTime();
            const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
            if (now - lastActivity > SESSION_TIMEOUT) {
                return res.status(401).json({ message: 'Session expired due to inactivity' });
            }
        }

        // Update last activity
        await user.update({ lastActivity: new Date() });

        res.json({ user });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired' });
        }
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;

