import { uploadFile } from "../utils/s3/index.js";
import S3_FOLDERS from "../constants/s3Folders.js";
import catchAsync from "../utils/catchAsync.js";

export const uploadImage = catchAsync(async (req, res, next) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Image file is required.",
        });
    }


    const result = await uploadFile({
        file: req.file,
        folder: S3_FOLDERS[req.body.type],
    });

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: result
    });

});