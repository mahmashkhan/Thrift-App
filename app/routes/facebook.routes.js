import { facebookAuth, facebookCallback, loginFailed } from '../controllers/facebook.controller.js';
import { Router } from "express";

const router = Router();

router.get('/facebook', facebookAuth);
router.get('/auth/facebook/callback', facebookCallback);
router.get('/login-failed', loginFailed);

router.get('/login-success', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ success: false, message: 'No token provided' });
  }

  return res.status(200).json({
    success: true,
    message: 'Facebook Login Successful',
    token,
  });
});

export default router;
