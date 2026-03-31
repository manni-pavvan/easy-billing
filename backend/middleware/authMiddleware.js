import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not set');
    }
    return secret;
}

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, getJwtSecret());

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            const message =
                error?.name === 'TokenExpiredError'
                    ? 'Token expired'
                    : error?.name === 'JsonWebTokenError'
                        ? 'Invalid token'
                        : 'Not authorized';
            res.status(401).json({ message });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export default protect;
