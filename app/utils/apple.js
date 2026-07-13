import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";


const client = jwksClient({
    jwksUri: "https://appleid.apple.com/auth/keys",
});


const getAppleKey = (header, callback) => {
    client.getSigningKey(
        header.kid,
        function (err, key) {

            if (err) {
                return callback(err);
            }
            const signingKey = key.getPublicKey();
            callback(null, signingKey);
        }
    );
};


export const verifyAppleToken = (identityToken) => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            identityToken,
            getAppleKey,
            {
                algorithms: ["RS256"],
                issuer: "https://appleid.apple.com",
                audience: process.env.APPLE_CLIENT_ID,
            },
            (err, decoded) => {
                if (err) {
                    return reject(err);
                }
                resolve(decoded);
            }
        );
    });
};