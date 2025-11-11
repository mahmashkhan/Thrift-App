const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/google/callback", // must match Google Console
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1️ Try to find user by googleId
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // 2️ Check if email already exists
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account
            user.googleId = profile.id;
            await user.save();
          } else {
            // 3️ Create new user
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              role: "buyer",
            });
          }
        }

        // Successfully found or created user
        return done(null, user);
      } catch (err) {
        // Handle Mongoose duplicate key or validation errors
        if (err.name === 'MongoServerError' && err.code === 11000) {
          console.error('Duplicate key error:', err.keyValue);
          return done(null, false, { message: `User with this ${Object.keys(err.keyValue)} already exists.` });
        }

        if (err.name === 'ValidationError') {
          console.error('Validation error:', err.errors);
          return done(null, false, { message: err.message });
        }

        // Any other unexpected errors
        console.error('Unexpected error during Google OAuth:', err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  try {
    done(null, user.id);
  } catch (err) {
    console.error('Error serializing user:', err);
    done(err, null);
  }
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(u => done(null, u))
    .catch(err => {
      console.error('Error deserializing user:', err);
      done(err, null);
    });
});
