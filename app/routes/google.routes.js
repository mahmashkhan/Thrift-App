import { Router } from "express";
import { googleAuth, googleCallback, googleFailure } from '../controllers/google.controller.js';

const router = Router();

router.get('/google', googleAuth);
router.get('/auth/google/callback', googleCallback);
router.get('/login-failed', googleFailure);

export default router;

