import { appleAuth, appleCallback, loginFailed } from '../controllers/apple.controller.js';
import { Router } from "express";

const router = Router();

router.get('/apple', appleAuth);
router.post('/auth/apple/callback', appleCallback);
router.get('/login-failed', loginFailed);

router.get('/login-success', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ success: false, message: 'No token provided' });
  }

  return res.status(200).json({
    success: true,
    message: 'Apple Login Successful',
    token,
  });
});

export default router;
