import { Router } from "express";
import passport, { Profile } from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import pool from "../../../config/db.js";
import { generateToken } from "../../../utils/auth.js";

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
        const email = profile.emails?.[0].value;
        const username = profile.displayName;
        const avatar = profile.photos?.[0].value;

        // check if user exists
        let result = await pool.query(`SELECT * FROM users WHERE email=$1`, [
          email,
        ]);
        let user = result.rows[0];

        if (!user) {
          result = await pool.query(
            `INSERT INTO users (username, email, avatar, provider)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [username, email, avatar, "google"]
          );
          user = result.rows[0];
        }

        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

router.get("/google", (req, res, next) => {
  const redirectUrl = req.query.redirectUrl as string;

  const authenticator = passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirectUrl,
  });

  authenticator(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req: any, res) => {
    const token = generateToken(req.user.id);
    const redirectUrl = req.query.state;

    if (redirectUrl) {
      // redirect to frontend with token, then fetch user data in frontend
      res.redirect(`${redirectUrl}?token=${token}`);
    }
  }
);

export default router;

// http://localhost:8000/api/v1/oauth2/google?redirectUrl=http://localhost:3000
