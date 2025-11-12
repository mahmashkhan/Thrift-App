export const signupValidation = (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const allowedRoles = ["buyer", "seller", "influencer"];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            message: `Role must be one of: ${allowedRoles.join(", ")}`,
        });
    }

    next();
};