import jwt from 'jsonwebtoken';

export const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is not configured');
    }

    return secret;
};

export const authenticate = (req, res, next) => {
    const authorization = req.get('Authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authorization.slice('Bearer '.length).trim();

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        req.user = jwt.verify(token, getJwtSecret());
        next();
    } catch (error) {
        if (error.message === 'JWT_SECRET is not configured') {
            return res.status(500).json({ message: 'Server authentication is not configured' });
        }

        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }

    next();
};

export const authorizeSelfOrAdmin = (paramName) => (req, res, next) => {
    const requestedUserId = req.params[paramName];
    const isOwner = req.user && String(req.user.id) === String(requestedUserId);
    const isAdmin = req.user && req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'You can only access your own data' });
    }

    next();
};
