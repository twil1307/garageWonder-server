import createError from "http-errors";
import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import logger from "morgan";
import connectRedis from "./config/redis.js";
import globalErrorHandler from "./utils/globalErrorHandler.js";
import { fileURLToPath } from "url";
import apiRouter from "./routes/index.js";
import dotenv from "dotenv";
import connectFireBase from "./config/firebase.js";
dotenv.config();

// Database configuration ----------------------------
import setupDatabase from "./config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var app = express();
connectRedis();
connectFireBase();
setupDatabase();

app.use(logger("dev"));
// app.use(json());
// app.use(urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    credentials: true,
    origin: [
      process.env.FRONTEND_URL,
      process.env.OUTSIDE_URL,
      "https://localhost:5173",
      "https://scaling-space-couscous-r4g5g7565wf5675-5173.app.github.dev",
      "https://cautious-waddle-gj6gx45r49fvrrj-5173.app.github.dev/",
    ],
    optionsSuccessStatus: 200,
  })
);

app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(globalErrorHandler);

export default app;
