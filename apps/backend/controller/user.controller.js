import dotenv from "dotenv";
dotenv.config();

import User from "../models/user.model.js";
import { hashPassword, comparePassword } from "../helper/passwordService.js";
// import { generateAccessToken, generateRefreshToken, expireTokens } from '../helper/jwtService.js';
// import { verify } from 'jsonwebtoken';
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import dataResponse from "../utils/dataResponse.js";
import { ObjectId } from "mongodb";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { firebaseAdmin } from "../config/firebase.js";

export const getUser = catchAsync(async (req, res, next) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json(dataResponse(null, 400, "Uid or id required"));
  }

  const isObjectId = ObjectId.isValid(uid);

  const pipeline = { [isObjectId ? "_id" : "uid"]: uid };

  const userFind = await User.findOne(pipeline);

  if (userFind) {
    return res
      .status(200)
      .json(dataResponse(userFind, 200, "User found successfully"));
  } else {
    return next(new AppError("User not found", 404));
  }
});

export const signUpUser = catchAsync(async (req, res, next) => {
  const { uid, email } = req.body;

  const existedUser = await User.findOne({
    $or: [{ uid: uid }, { email: email }],
  });

  const customToken = await firebaseAdmin.auth().createCustomToken(uid);

  if (existedUser) {
    return res
      .status(400)
      .json(dataResponse({token: customToken}, 400, "User existed - redirect to login"));
  }

  const phoneNumber = req.body.providerData[0].phoneNumber || null;

  const user = new User(req.body);
  user.phoneNumber = phoneNumber;

  const savedUser = await user.save();

  return res
    .status(200)
    .json(dataResponse({user: savedUser, token: customToken}, 200, "Create user successfully"));
});

export const updateUser = catchAsync(async (req, res, next) => {
  const file = req.file;
  let imageUrl = null;
  const userObj = req.body;
  if (file) {
    imageUrl = file.path;
    userObj.avatar = imageUrl.split("public")[1].replaceAll("\\", "/");
  }
  if (userObj.dob) {
    userObj.dob = new Date(userObj.dob).toDateString();
  }
  const userId = req.user._id;

  const newUser = await User.findByIdAndUpdate(userId, userObj, { new: true });
  return res.status(200).json({
    user: newUser,
  });
});

export const updateUserBankingAccount = catchAsync(
  async (req, res, next) => {}
);

export const logIn = catchAsync(async (req, res, next) => {
  const userObj = new User(req.body);

  const user = await User.findOne({ username: userObj.username });

  console.log(user);

  if (user) {
    const result = await comparePassword(userObj.password, user.password);

    if (!result) {
      return next(new AppError("Password is incorrect", 403));
    } else {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      return res
        .status(200)
        .cookie("accessToken", "Bearer " + accessToken, {
          httpOnly: true,
          secure: false,
        })
        .cookie("refreshToken", "Refresh " + refreshToken, {
          httpOnly: true,
          secure: false,
        })
        .json({
          message: "Login successfully",
          user: {
            _id: user._id,
            role: user.role,
            username: user.username,
            displayName: `${user.subName} ${user.name}`,
            hotelBookmarked: user.hotelBookmarked,
            bankingAccount: user.bankingAccountNumber || null,
          },
        });
    }
  } else {
    return next(new AppError("No user found", 404));
  }
});

export const logOut = catchAsync(async (req, res, next) => {
  res.setHeader("Set-Cookie", expireTokens);

  return res.status(200).json({ message: "Log out successfully" });
});

export const addOrRemoveFavorite = catchAsync(async (req, res, next) => {
  return res.json(null);
});

export const updateBankAccount = catchAsync(async (req, res, next) => {});

export const getUserRemainingAmount = catchAsync(async (req, res, next) => {});

export const getUserFavoriteGarage = catchAsync(async (req, res, next) => {});

export const getUserBookingHistory = catchAsync(async (req, res, next) => {});

export const getUserFirebase = catchAsync(async (req, res, next) => {

  const { authorization } = req.headers;
  const token = authorization.replace("Bearer ", "")

  const verifiedOne = await firebaseAdmin.auth().verifyIdToken(token);

  return res.status(200).json(verifiedOne);
  
});
