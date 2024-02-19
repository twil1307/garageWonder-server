import dotenv from 'dotenv';
dotenv.config();

import User from '../models/user.model.js';
import { hashPassword, comparePassword } from '../helper/passwordService.js';
// import { generateAccessToken, generateRefreshToken, expireTokens } from '../helper/jwtService.js';
// import { verify } from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import dataResponse from '../utils/dataResponse.js';

export const getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json(dataResponse(null, 400, 'Uid or id required'));
  }

  const userFind = await User.findOne({
    $or: [
      { uid: id },
      { _id: id }
    ]
  })

  if (userFind) {
    return res.status(200).json(dataResponse(userFind, 200, 'User found successfully'));
  } else {
    return next(new AppError('User not found', 404));
  }
});

export const signUpUser = catchAsync(async (req, res, next) => {

  const user = new User(req.body);

  const existedUser = await User.findOne({
    $or: [
      { uid: user.uid },
      { email: user.email }
    ]
   });

  if(existedUser) {
    return res.status(400).json(dataResponse(null, 400, 'User existed - redirect to login'));
  };

  const savedUser = await user.save();

  return res.status(200).json(dataResponse(savedUser, 200, 'Create user successfully'));
});

export const updateUser = catchAsync(async (req, res, next) => {
  const file = req.file;
  let imageUrl = null;
  const userObj = req.body;
  if (file) {
    imageUrl = file.path;
    userObj.avatar = imageUrl.split('public')[1].replaceAll('\\', '/');
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

export const updateUserBankingAccount = catchAsync(async (req, res, next) => {
});

export const logIn = catchAsync(async (req, res, next) => {
  const userObj = new User(req.body);

  const user = await User.findOne({ username: userObj.username });

  console.log(user);

  if (user) {
    const result = await comparePassword(userObj.password, user.password);

    if (!result) {
      return next(new AppError('Password is incorrect', 403));
    } else {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      return res
        .status(200)
        .cookie('accessToken', 'Bearer ' + accessToken, {
          httpOnly: true,
          secure: false,
        })
        .cookie('refreshToken', 'Refresh ' + refreshToken, {
          httpOnly: true,
          secure: false,
        })
        .json({
          message: 'Login successfully',
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
    return next(new AppError('No user found', 404));
  }
});

export function refreshNewTokens(req, res, next) {
  const { refreshToken } = req.cookies;

  console.log(refreshToken);

  if (!refreshToken) {
    return res.status(401).json({ error: 'Login required' });
  }

  const token = refreshToken.replace('Refresh ', '');

  verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(479).json({ error: err.message });
    }

    const idFind = decoded._id;

    User.findOne({ _id: idFind })
      .then((user) => {
        if (user) {
          return user;
        } else {
          return res.status(422).json({ error: 'User is not available' });
        }
      })
      .then((user) => {
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        return res
          .status(200)
          .cookie('accessToken', 'Bearer ' + newAccessToken, {
            httpOnly: true,
            secure: false,
          })
          .cookie('refreshToken', 'Refresh ' + newRefreshToken, {
            httpOnly: true,
            secure: false,
          })
          .json({
            message: 'Retrieve new token successfully',
          });
      })
      .catch((err) => {
        console.log('haha');
        console.log(err);
      });
  });
}

export const compareCurrentPassword = catchAsync(async (req, res, next) => {
  // Hash user password
  const passwordPlain = req.body.currentPassword;

  const { password } = await User.findById(req.user._id).select('password');

  const compareRes = await comparePassword(passwordPlain, password);

  if (compareRes) {
    return res.status(202).json({
      message: 'Password matched',
    });
  } else {
    return next(new AppError('Password is incorrect', 401));
  }
});

export const verifyJwtToken = catchAsync(async (req, res, next) => {
  // Hash user password
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return res.status(401).json({
      message: 'Login required',
    });
  }

  const token = accessToken.replace('Bearer ', '');

  const result = await verify(token, process.env.ACCESS_TOKEN_SECRET);

  const userData = await User.findOne({ _id: result._id });

  if (userData) {
    return res.status(202).json({
      message: 'User already login',
    });
  } else {
    return res.status(405).json({
      message: 'User has not login yet',
    });
  }
});

export const logOut = catchAsync(async (req, res, next) => {
  res.setHeader('Set-Cookie', expireTokens);

  return res.status(200).json({ message: 'Log out successfully' });
});

export const changePassword = catchAsync(async (req, res, next) => {
  const newPasword = req.body.newPassword;
  const userId = req.user._id;

  const newHashPassword = await hashPassword(newPasword);

  const user = await User.updateOne(
    { _id: userId },
    { $set: { password: newHashPassword } }
  );

  if (user) {
    // Clear the cookie by setting an expired token value and past expiration date
    res.setHeader('Set-Cookie', expireTokens);

    return res.status(200).json({ message: 'Passwords updated successfully' });
  } else {
    return next(new AppError('Passwords updated failed', 500));
  }
});

export const addOrRemoveFavorite = catchAsync(async (req, res, next) => {
  return res.json(null);
});

export const updateBankAccount = catchAsync(async (req, res, next) => {
});

export const getUserRemainingAmount = catchAsync(async (req, res, next) => {
});

export const getUserFavouriteGarage = catchAsync(async (req, res, next) => {
});

export const getUserBookingHistory = catchAsync(async (req, res, next) => {
});
