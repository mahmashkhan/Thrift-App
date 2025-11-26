export const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            status: "01",
            successIndicator: "failed",
            message: error.details[0].message
        });
    }

    next();
};
