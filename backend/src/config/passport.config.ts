import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Request } from "express";

import { config } from "./app.config.js";
import { NotFoundException } from "../utils/appError.js";
import { ProviderEnum } from "../enums/account-provider.enum.js";
import { loginOrCreateAccountService } from "../services/auth.service.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    async (req: Request, accessToken, refreshToken, profile, done) => {
      try {
        const { email, sub: googleId, picture } = profile._json;
        console.log(googleId, "googleId");
        console.log(profile, "profile");

        if (!googleId) {
          throw new NotFoundException("Google ID (sub) is missing");
        }

        const { user } = await loginOrCreateAccountService({
          provider: ProviderEnum.GOOGLE,
          displayName: profile.displayName || "",
          providerId: googleId,
          email: email || "",
          picture: picture || "",
        });

        done(null, user);
      } catch (error) {
        done(error, false);
      }
    },
  ),
);
