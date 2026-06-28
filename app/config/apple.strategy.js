import passport from 'passport';
import AppleStrategy from 'passport-apple';
import User from '../models/user.model.js';
import 'dotenv/config';

passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    callbackURL: process.env.APPLE_CALLBACK_URL || "http://localhost:4000/auth/apple/callback",
    keyID: process.env.APPLE_KEY_ID,
    privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION,
    passReqToCallback: true
  },
  async function(req, accessToken, refreshToken, idToken, profile, cb) {
    try {
      const appleId = idToken.sub;
      const email = idToken.email;
      const name = req.body?.user
        ? `${req.body.user.name?.firstName || ''} ${req.body.user.name?.lastName || ''}`.trim()
        : null;

      let user = await User.findOne({ appleId });

      if (!user) {
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            user.appleId = appleId;
            await user.save();
          }
        }

        if (!user) {
          user = await User.create({
            appleId,
            name: name || 'Apple User',
            email: email || `${appleId}@apple.placeholder`,
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
