const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; // Check for token in cookies or Authorization header
        
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        req.user = user; // Attach user to request object
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

const authSystemAuthMiddleware = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; // Check for token in cookies or Authorization header
    
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId).select('+systemUser'); // Ensure systemUser field is selected
        if (!user || !user.systemUser) {
            return res.status(403).json({ message: "Forbidden: Access is denied" });
        }

        req.user = user; // Attach user to request object
        next();
    } catch (error) {
        console.error("System authentication error:", error);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
}

module.exports = {
    authMiddleware,
    authSystemAuthMiddleware        
}