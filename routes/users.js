const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get User model from app locals
const getUserModel = (req) => req.app.locals.models.User;

// Get all users (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const User = getUserModel(req);
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single user (admin only)
router.get('/:id', auth, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const User = getUserModel(req);
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create user (admin only)
router.post('/', auth, adminOnly, [
    body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3, max: 50 }),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'editor']).withMessage('Role must be admin or editor')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { username, email, password, role } = req.body;
        const User = getUserModel(req);
        
        // Check if username or email already exists
        const existingUser = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { username: username },
                    { email: email }
                ]
            }
        });
        
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        
        const user = await User.create({
            username: username.trim(),
            email: email.trim(),
            password: password,
            role: role || 'editor'
        });
        
        // Return user without password
        const userResponse = user.toJSON();
        delete userResponse.password;
        
        res.status(201).json({ message: 'User created successfully', user: userResponse });
    } catch (error) {
        console.error('User creation error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user (admin only)
router.put('/:id', auth, adminOnly, [
    body('username').optional().trim().isLength({ min: 3, max: 50 }),
    body('email').optional().trim().isEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('role').optional().isIn(['admin', 'editor'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { id } = req.params;
        const { username, email, password, role } = req.body;
        const User = getUserModel(req);
        
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if username or email already exists (excluding current user)
        if (username || email) {
            const existingUser = await User.findOne({
                where: {
                    id: { [require('sequelize').Op.ne]: id },
                    [require('sequelize').Op.or]: [
                        ...(username ? [{ username: username }] : []),
                        ...(email ? [{ email: email }] : [])
                    ]
                }
            });
            
            if (existingUser) {
                return res.status(400).json({ message: 'Username or email already exists' });
            }
        }
        
        // Update fields
        if (username) user.username = username.trim();
        if (email) user.email = email.trim();
        if (password) user.password = password; // Will be hashed by model hook
        if (role) user.role = role;
        
        await user.save();
        
        // Return user without password
        const userResponse = user.toJSON();
        delete userResponse.password;
        
        res.json({ message: 'User updated successfully', user: userResponse });
    } catch (error) {
        console.error('User update error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete user (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const User = getUserModel(req);
        
        // Prevent deleting yourself
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }
        
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

