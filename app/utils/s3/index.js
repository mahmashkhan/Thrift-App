import { PutObjectCommand, DeleteObjectCommand, } from "@aws-sdk/client-s3";

import path from "path";
import crypto from "crypto";

import s3Client from "../../config/aws.js";

const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION;


const generateKey = (folder, originalName, id = "") => {
    const extension = path.extname(originalName);

    const randomName = crypto.randomBytes(8).toString("hex") + Date.now();

    if (id) {
        return `${folder}/${id}/${randomName}${extension}`;
    }

    return `${folder}/${randomName}${extension}`;
};


const uploadFile = async ({ file, folder, id = "", }) => {

    const key = generateKey(
        folder,
        file.originalname,
        id
    );

    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await s3Client.send(command);

    return {
        path: key,
        fileName: file.originalname,
        contentType: file.mimetype,
        sizeInBytes: file.size,
    };
};

/**
 * Delete file
 */
const deleteFile = async (key) => {

    const command = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
    });

    await s3Client.send(command);

    return true;
};

/**
 * Generate Public URL
 */
const getPublicUrl = (key) => {

    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

};

export {
    uploadFile,
    deleteFile,
    generateKey,
    getPublicUrl,
};