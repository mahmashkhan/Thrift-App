export const sanitizeResponse = (data) => {

    const sanitizeObject = (obj) => {
        // Handle both Mongoose documents and plain objects
        const sanitized =
            typeof obj?.toObject === "function"
                ? obj.toObject()
                : { ...obj };

        delete sanitized.createdAt;
        delete sanitized.updatedAt;
        delete sanitized.__v;
        delete sanitized.password;

        // Remove influencer fields for non-influencers
        if (sanitized.role !== "influencer") {
            delete sanitized.commissionRate;
            delete sanitized.campaigns_run;
            delete sanitized.total_referrals;
            delete sanitized.commission_earned;
        }

        return sanitized;
    };

    if (Array.isArray(data)) {
        return data.map(sanitizeObject);
    }

    if (!data) {
        return data;
    }

    return sanitizeObject(data);
};