import AppError from "./appError.js";
import dataResponse from "./dataResponse.js";

export default (err, req, res, next) => {
  let error = { ...err };

  console.log(err);

  if (err.name === "CastError") error = handleCastErrorDB(err);
  if (err.name === "BSONTypeError") error = handleInvalidId(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === "ValidationError") error = handleValidationErrorDB(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
  if (err.name === "Error") error = err;

  return res.status(error.statusCode || 500).json(dataResponse(null, error.statusCode || 500, error.message || 'Something went wrong'));
};

// handle schema validation
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;

  return new AppError(message, 400);
};

// handle jwt error
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

// handle jwt expired
const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

// Cast db error
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// handle invalid id
const handleInvalidId = (err) => {
  const message = `Invalid id ${err.value ? err.value : ""}`;
  return new AppError(message, 400);
};

// duplicate field error
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
