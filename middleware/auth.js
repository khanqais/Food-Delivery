// middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token; 
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { userId: decoded.userId, name: decoded.name };
        } catch (error) {
            console.error(error);
        }
    }
    next();
};

module.exports = authMiddleware;