// controllers/googleController.js
const passport = require('passport');
const jwt = require('jsonwebtoken');


exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});


exports.googleCallback = (req, res, next) => {
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
    res.redirect(`http://localhost:3000/login-success?token=${token}`);
  })(req, res, next);
};

// Step 3: Failure case
exports.googleFailure = (req, res) => {
  res.status(401).json({ success: false, message: 'Google Login Failed' });
};
