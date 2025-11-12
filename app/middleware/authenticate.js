import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

const authenticateUser = async (req, res, next) => {
    const bearer = req.headers['authorization'];
    if (!bearer) return res.status(401).json({ error: "Access Deniedd" });
    const token = bearer.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: "access Denied" });
    }

    try {
        const verify = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verify;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid Token" });
    }
}

export { authenticateUser };