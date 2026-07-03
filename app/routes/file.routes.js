import express from "express";

import upload from "../middleware/upload.middleware.js";
import { uploadImage } from "../controllers/file.controller.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadImage);

export default router;