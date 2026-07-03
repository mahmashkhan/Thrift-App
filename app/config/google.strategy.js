import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import {User} from '../models/user.model.js';
import dotenv from "dotenv";
dotenv.config();

// Initialize Google Strategy
passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/google/callback", // must match Google Console
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1️ Check if user exists with googleId
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // 2️ Check if email already exists in database
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account if email found
            user.googleId = profile.id;
            await user.save();
          } else {
            // 3️ Create new user
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              role: 'buyer',
            });
          }
        }

        //  Pass user forward — passport will attach to req.user
        return done(null, user);
      } catch (err) {
        console.error('Google OAuth error:', err);
        return done(err, null);
      }
    }
  )
);
