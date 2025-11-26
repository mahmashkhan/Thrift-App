import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.JWT_SECRET;

// Middleware: verify token + check roles
export const allowedUsers = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            // Get authorization header
            const authHeader = req.headers.authorization || req.headers.Authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ message: "Unauthorized: No token provided" });
            }

            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, secret);

            if (!decoded || !decoded.id) {
                return res.status(401).json({ message: "Unauthorized: Invalid token" });
            }

            // Get user from DB without password
            const user = await User.findById(decoded.id).select("-password");
            if (!user) {
                return res.status(401).json({ message: "Unauthorized: User not found" });
            }

            // Save user to request
            req.user = user;

            // If middleware has role restrictions, validate
            if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                return res.status(403).json({ message: "Forbidden: Not allowed" });
            }

            next();
        } catch (error) {
            console.error("AllowedUsers middleware error:", error);
            return res.status(401).json({ message: "Unauthorized: Token failed" });
        }
    };
};
