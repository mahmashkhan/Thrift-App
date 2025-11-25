export const isAdmin = (...allowedRoles) => (req, res, next) => {
    const { role } = req.body;
    if (!role || !allowedRoles.includes("admin")) {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
};
