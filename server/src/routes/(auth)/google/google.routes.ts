import { Router } from "express";
import passport, { Profile } from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import prisma from "../../../config/prisma";
import { generateToken } from "../../../utils/auth";

const router = Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.SERVER_URL}/api/v1/oauth2/google/callback`,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Google profile"), undefined);
        }

        const username = profile.displayName ?? email.split("@")[0];
        const avatar = profile.photos?.[0]?.value ?? null;

        // Upsert: create if missing, otherwise update some fields
        const user = await prisma.users.upsert({
          where: { email },
          update: {
            username,
            avatar,
            provider: "google",
          },
          create: {
            username,
            email,
            avatar,
            provider: "google",
            password: Math.random().toString(36).slice(-8), // placeholder password for OAuth users
          },
        });

        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

// Initiate auth (state used to carry redirectUrl)
router.get("/google", (req, res, next) => {
  const redirectUrl = (req.query.redirectUrl as string) || undefined;

  const authenticator = passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirectUrl,
  });

  authenticator(req, res, next);
});

// Callback: issue token and redirect back to frontend
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req: any, res) => {
    if (!req.user) {
      return res.status(400).json({ message: "No user returned from Google" });
    }

    const token = generateToken(req.user.id);
    const redirectUrl = req.query.state as string | undefined;

    if (redirectUrl) {
      return res.redirect(`${redirectUrl}?token=${token}`);
    }

    // Fallback: respond with token if no redirect was provided
    res.json({ token });
  }
);

export default router;
