import { Router } from "express";
import { googleAuth, googleCallback, googleFailure } from '../controllers/google.controller.js';

const router = Router();

router.get('/google', googleAuth);
router.get('/auth/google/callback', googleCallback);
router.get('/login-failed', googleFailure);

router.get('/login-success', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ success: false, message: 'No token provided' });
  }

  return res.status(200).json({
    success: true,
    message: 'Google Login Successful',
    token,
  });
});
export default router;

