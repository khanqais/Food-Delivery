// middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token; // Now this should work
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { userId: decoded.userId, name: decoded.name }; // Store user info in req.user
        } catch (error) {
            console.error(error);
        }
    }
    next();
};

module.exports = authMiddleware;