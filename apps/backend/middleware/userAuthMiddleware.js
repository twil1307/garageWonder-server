import catchAsync from "../utils/catchAsync.js";
import User from "../models/user.model.js"
import { firebaseAdmin } from "../config/firebase.js";
import dataResponse from "../utils/dataResponse.js";

export const hasRole = (...role) => {
  return catchAsync(async (req, res, next) => {
    const { authorization } = req.headers;

    if(!authorization) {
      return res.status(400).json(dataResponse(null, 400, "Please login!"));
    }

    const token = authorization.replace("Bearer ", "");

    const userLoginId = await firebaseAdmin.auth().verifyIdToken(token);

    if(!userLoginId) {
      return res.status(400).json(dataResponse(null, 400, "You are not authorized!"));
    }
    
    const currentUser = await User.findOne({
      uid: userLoginId.uid
    });

    if(!currentUser) {
      return res.status(400).json(dataResponse(null, 400, "This user is not belong to the system!"));
    }

    if(role.includes(currentUser.role)) {
      req.user = currentUser;
      return next();
    } else {
      return res.status(400).json(dataResponse(null, 400, "You are not authorized!"));
    }
  });
};

export const hasRoleWithData = (...role) => {
  return catchAsync(async (req, res, next) => {

    const currentUser = req.user;

    if(role.includes(currentUser.role)) {
      return next();
    } else {
      return res.status(400).json(dataResponse(null, 400, "You are not authorized!"));
    }
  });
};
