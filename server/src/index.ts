import "dotenv/config";
import cookieParser from "cookie-parser";

import cors from "cors";
import express from "express";
import authRoutes from "./routes/(auth)/auth/auth.routes.js";
import googleRoutes from "./routes/(auth)/google/google.routes.ts";

import urlRoutes from "./routes/url/url.routes.ts";

import redirectsRoutes from "./routes/redirects/redirect.routes.ts";

import userRoutes from "./routes/user/user.routes.ts";

const app = express();

app.use(cookieParser());

const PORT = process.env.PORT ?? 8000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/oauth2", googleRoutes);

app.use("/api/v1/url", urlRoutes);

app.use("/api/v1/user", userRoutes);

app.use("/", redirectsRoutes);

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`app is listening on ${process.env.SERVER_URL}`);
  });
};

startServer();
