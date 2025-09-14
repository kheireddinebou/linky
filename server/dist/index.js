// src/index.ts
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

// src/routes/(auth)/auth/auth.routes.ts
import { Router } from "express";

// src/config/prisma.ts
import { PrismaClient } from "@prisma/client";
var prisma = global.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
var prisma_default = prisma;

// src/utils/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
var JWT_SECRET = process.env.JWT_SECRET || "supersecret";
var hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};
var comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
var generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};
var setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    // JS can't access
    secure: process.env.NODE_ENV === "production",
    // only https in prod
    sameSite: "strict",
    // protect against CSRF
    maxAge: 7 * 24 * 60 * 60 * 1e3
    // 7 days
  });
};
function generateUsername(email) {
  const base = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
  const suffix = Math.floor(1e3 + Math.random() * 9e3);
  return `${base}${suffix}`;
}
function isPasswordStrong(password) {
  return password.length >= 8;
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// src/routes/(auth)/auth/auth.controller.ts
var httpRegisterWithEmail = async (req, res) => {
  const { email, password, first_name, last_name } = req.body || {};
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    if (!isPasswordStrong(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
    const existingByEmail = await prisma_default.users.findUnique({
      where: { email },
      select: { id: true }
    });
    if (existingByEmail) {
      return res.status(400).json({ error: "Email already registered" });
    }
    let username;
    let exists = true;
    do {
      username = generateUsername(email);
      const existing = await prisma_default.users.findUnique({
        where: { username },
        select: { id: true }
      });
      exists = !!existing;
    } while (exists);
    const hashed = await hashPassword(password);
    const user = await prisma_default.users.create({
      data: {
        username,
        email,
        password: hashed,
        provider: "local",
        first_name: first_name || null,
        last_name: last_name || null
      },
      // you can omit select to get full row; but don't return password
      select: {
        password: false,
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        avatar: true,
        provider: true,
        created_at: true
      }
    });
    const token = generateToken(user.id);
    setAuthCookie(res, token);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
var httpLogin = async (req, res) => {
  const { email, password } = req.body || {};
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await prisma_default.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        first_name: true,
        last_name: true,
        avatar: true,
        provider: true
      }
    });
    if (!user) {
      return res.status(400).json({ error: "Email does not exist" });
    }
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Password is not correct !" });
    }
    const token = generateToken(user.id);
    setAuthCookie(res, token);
    const { password: _pw, ...others } = user;
    res.json({ user: others });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// src/routes/(auth)/auth/auth.routes.ts
var router = Router();
router.post("/register", httpRegisterWithEmail);
router.post("/login", httpLogin);
var auth_routes_default = router;

// src/routes/(auth)/google/google.routes.ts
import { Router as Router2 } from "express";
import passport from "passport";
import {
  Strategy as GoogleStrategy
} from "passport-google-oauth20";
var router2 = Router2();
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/v1/oauth2/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Google profile"), void 0);
        }
        const username = profile.displayName ?? email.split("@")[0];
        const avatar = profile.photos?.[0]?.value ?? null;
        const user = await prisma_default.users.upsert({
          where: { email },
          update: {
            username,
            avatar,
            provider: "google"
          },
          create: {
            username,
            email,
            avatar,
            provider: "google",
            password: Math.random().toString(36).slice(-8)
            // placeholder password for OAuth users
          }
        });
        return done(null, user);
      } catch (err) {
        return done(err, void 0);
      }
    }
  )
);
router2.get("/google", (req, res, next) => {
  const redirectUrl = req.query.redirectUrl || void 0;
  const authenticator = passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirectUrl
  });
  authenticator(req, res, next);
});
router2.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    if (!req.user) {
      return res.status(400).json({ message: "No user returned from Google" });
    }
    const token = generateToken(req.user.id);
    const redirectUrl = req.query.state;
    if (redirectUrl) {
      return res.redirect(`${redirectUrl}?token=${token}`);
    }
    res.json({ token });
  }
);
var google_routes_default = router2;

// src/routes/url/url.routes.ts
import { Router as Router3 } from "express";

// src/middlewares/auth.ts
import jwt2 from "jsonwebtoken";
var authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt2.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// src/config/redis.ts
import Redis from "ioredis";
var redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
var redis_default = redis;

// src/utils/redist.ts
var cacheInRedis = (short_code, original_url) => redis_default.set(short_code, original_url, "EX", 60 * 60 * 24);

// src/routes/url/url.controller.ts
var httpCreateUrl = async (req, res) => {
  try {
    const { original_url, title } = req.body;
    const userIdRaw = req.userId;
    const userId = Number(userIdRaw);
    if (!original_url) {
      return res.status(400).json({ message: "original_url is required" });
    }
    try {
      new URL(original_url);
    } catch {
      return res.status(400).json({ message: "Invalid URL format" });
    }
    const shortCode = Math.random().toString(36).substring(2, 10);
    cacheInRedis(shortCode, original_url);
    const created = await prisma_default.urls.create({
      data: {
        user_id: userId,
        original_url,
        short_code: shortCode,
        title: title ?? null
      }
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
var httpGetUrls = async (req, res) => {
  try {
    const userId = Number(req.userId);
    const urls = await prisma_default.urls.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" }
    });
    res.status(200).json(urls);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
var httpGetUrl = async (req, res) => {
  try {
    const userId = Number(req.userId);
    const { id } = req.params;
    const idNum = Number(id);
    const url = await prisma_default.urls.findFirst({
      where: { id: idNum, user_id: userId }
    });
    if (!url) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(url);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
var httpUpdateUrl = async (req, res) => {
  try {
    const userId = Number(req.userId);
    const { id } = req.params;
    const idNum = Number(id);
    const { original_url, title } = req.body;
    if (!original_url && title === void 0) {
      return res.status(400).json({ message: "Provide at least one field to update" });
    }
    if (original_url) {
      try {
        new URL(original_url);
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }
    }
    const existing = await prisma_default.urls.findFirst({
      where: { id: idNum, user_id: userId }
    });
    if (!existing) {
      return res.status(404).json({ message: "Not found" });
    }
    const data = {};
    if (original_url) data.original_url = original_url;
    if (title !== void 0) data.title = title;
    data.updated_at = /* @__PURE__ */ new Date();
    const updated = await prisma_default.urls.update({
      where: { id: existing.id },
      data
    });
    if (original_url) {
      await redis_default.set(updated.short_code, updated.original_url);
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
var httpDeleteUrl = async (req, res) => {
  try {
    const userId = Number(req.userId);
    const { id } = req.params;
    const idNum = Number(id);
    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }
    const existing = await prisma_default.urls.findFirst({
      where: { id: idNum, user_id: userId }
    });
    if (!existing) {
      return res.status(404).json({ message: "Not found" });
    }
    await prisma_default.urls.delete({ where: { id: existing.id } });
    await redis_default.del(existing.short_code);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// src/routes/url/url.routes.ts
var router3 = Router3();
router3.post("/", authenticate, httpCreateUrl);
router3.get("/", authenticate, httpGetUrls);
router3.get("/:id", authenticate, httpGetUrl);
router3.put("/:id", authenticate, httpUpdateUrl);
router3.delete("/:id", authenticate, httpDeleteUrl);
var url_routes_default = router3;

// src/routes/redirects/redirect.routes.ts
import { Router as Router4 } from "express";

// src/routes/redirects/redirects.controller.ts
var httpRedirectToOriginalUrl = async (req, res) => {
  const { shortCode } = req.params;
  try {
    let originalUrl = await redis_default.get(shortCode);
    if (!originalUrl) {
      const record = await prisma_default.urls.findUnique({
        where: { short_code: shortCode },
        select: { original_url: true, short_code: true }
      });
      if (!record) {
        return res.status(404).json({ message: "URL not found" });
      }
      originalUrl = record.original_url;
      cacheInRedis(shortCode, originalUrl);
    }
    res.redirect(originalUrl);
    prisma_default.urls.update({
      where: { short_code: shortCode },
      data: { clicks: { increment: 1 } }
    }).catch((err) => {
      console.error("Failed to increment clicks", err);
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// src/routes/redirects/redirect.routes.ts
var router4 = Router4();
router4.get("/:shortCode", httpRedirectToOriginalUrl);
var redirect_routes_default = router4;

// src/routes/user/user.routes.ts
import { Router as Router5 } from "express";

// src/routes/user/user.controller.ts
var httpGetUserData = async (req, res) => {
  try {
    const userId = Number(req.userId);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: userId missing" });
    }
    const user = await prisma_default.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        avatar: true,
        provider: true,
        created_at: true
      }
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// src/routes/user/user.routes.ts
var router5 = Router5();
router5.get("/getUserData", authenticate, httpGetUserData);
var user_routes_default = router5;

// src/index.ts
var app = express();
app.use(cookieParser());
var PORT = process.env.PORT ?? 8e3;
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);
app.use(express.json());
app.use("/api/v1/auth", auth_routes_default);
app.use("/api/v1/oauth2", google_routes_default);
app.use("/api/v1/url", url_routes_default);
app.use("/api/v1/user", user_routes_default);
app.use("/", redirect_routes_default);
var startServer = async () => {
  app.listen(PORT, () => {
    console.log(`app is listening on ${process.env.SERVER_URL}`);
  });
};
startServer();
