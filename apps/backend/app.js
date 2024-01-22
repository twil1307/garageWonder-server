import createError from 'http-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import logger from 'morgan';
import connectRedis from './config/redis.js';
import globalErrorHandler from './utils/globalErrorHandler.js';

import apiRouter from './routes/index.js';

// Database configuration ----------------------------
import setupDatabase from './config/database.js';



var app = express();
connectRedis();
setupDatabase();

app.use(logger('dev'));
// app.use(json());
// app.use(urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    optionsSuccessStatus: 200,
  })
);

app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(globalErrorHandler);


export default app;
