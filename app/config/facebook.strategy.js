import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/user.model.js';
import 'dotenv/config';

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || "http://localhost:4000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails']
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      let user = await User.findOne({ facebookId: profile.id });

      if (!user) {
        const email = profile.emails?.[0]?.value;

        if (email) {
          user = await User.findOne({ email });
          if (user) {
            user.facebookId = profile.id;
            await user.save();
          }
        }

        if (!user) {
          user = await User.create({
            facebookId: profile.id,
            name: profile.displayName,
            email: email || `${profile.id}@facebook.placeholder`,
            role: 'buyer',
          });
        }
      }

      return cb(null, user);
    } catch (err) {
      return cb(err, null);
    }
  }
));
