// utils/orderSettlement.js

const orderSettlement = ({
    productType,
    productAmount,
    platformCommissionPercent,
    influencerCommissionPercent = 0
}) => {

    const platformCommission =
        (productAmount * platformCommissionPercent) / 100;

    switch (productType) {

        case "SELF_SELLING":

            return {
                productAmount,
                platformCommission,
                sellerAmount:
                    productAmount - platformCommission,

                influencerAmount: 0
            };

        case "SELL_FOR_ME":

            return {
                productAmount,
                platformCommission,
                sellerAmount:
                    productAmount - platformCommission,

                influencerAmount: 0
            };

        case "INFLUENCER":

            const influencerAmount =
                (productAmount * influencerCommissionPercent) / 100;

            return {
                productAmount,
                influencerAmount,

                platformCommission:
                    productAmount - influencerAmount,

                sellerAmount: 0
            };

        default:
            throw new Error("Invalid product type");
    }
};

module.exports = orderSettlement;