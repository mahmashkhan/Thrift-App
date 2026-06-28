import passport from 'passport';
import jwt from 'jsonwebtoken';

export const appleAuth = passport.authenticate('apple', {
  scope: ['name', 'email'],
});

export const appleCallback = (req, res, next) => {
  passport.authenticate('apple', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect('/login-failed');
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    res.redirect(`${baseUrl}/login-success?token=${token}`);
  })(req, res, next);
};

export const loginFailed = (req, res) => {
  return res.status(401).json({ success: false, message: 'Apple login failed' });
};
