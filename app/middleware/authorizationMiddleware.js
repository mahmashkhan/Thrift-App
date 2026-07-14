import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
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
            if (
                allowedRoles.length > 0 &&
                !user.roles.some(role => allowedRoles.includes(role))
            ) {
                return res.status(403).json({
                    status: "fail",
                    responseCode: "01",
                    message: "Action not allowed for this role",
                });
            }

            next();
        } catch (error) {
            console.error("AllowedUsers middleware error:", error);
            return res.status(401).json({ message: "Unauthorized: Token failed" });
        }
    };
};



// Middleware: attach user if token present, but never block unauthenticated requests
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, secret);
            if (decoded?.id) {
                const user = await User.findById(decoded.id).select("-password");
                if (user) req.user = user;
            }
        }
    } catch (_) {
        // invalid token — just continue as guest
    }
    next();
};

// middleware/canModifyUser.js

export const allowedadminOrOwner = async (req, res, next) => {

    try {
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



        console.log("Logged In user", user);

        const targetUserId = req.params.id;

        // Admin can modify anyone
        if (user?.role === "admin") {

            return next();
        }

        // User can modify own profile only
        if (user?._id.toString() === targetUserId) {
            return next();
        }

        console.log("Outside function2")
        return res.status(403).json({
            status: "fail",
            responseCode: "01",
            message: "You are not allowed to perform this action"
        });

    } catch (error) {

        return res.status(500).json({
            status: "fail",
            responseCode: "01",
            message: "Authorization failed"
        });
    }
};