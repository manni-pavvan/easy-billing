import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not set');
    }
    return secret;
}

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, getJwtSecret(), {
        expiresIn: '30d',
    });
};

const normalizeRole = (role) => {
    const r = String(role || '').toLowerCase();
    return r === 'worker' ? 'worker' : 'admin';
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const normalizedRole = normalizeRole(role);

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            role: normalizedRole,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const normalizedRole = normalizeRole(role);

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password)) && user.role === normalizedRole) {
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
