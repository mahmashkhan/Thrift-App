// controllers/googleController.js
import passport from 'passport';
import jwt from 'jsonwebtoken';


const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});


const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect('/login-failed');
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Redirect or send JSON (depends on frontend)
    res.redirect(`http://localhost:4000/login-success?token=${token}`);
  })(req, res, next);
};

// Step 3: Failure case
const googleFailure = (req, res) => {
  res.status(401).json({ success: false, message: 'Google Login Failed' });
};


export { googleAuth, googleCallback, googleFailure }