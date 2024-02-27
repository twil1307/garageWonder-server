import catchAsync from "../utils/catchAsync.js";
import User from "../models/user.model.js"
import { firebaseAdmin } from "../config/firebase.js";
import dataResponse from "../utils/dataResponse.js";

export const hasRole = (...role) => {
  return catchAsync(async (req, res, next) => {
    const { idtoken } = req.headers;

    const userLoginId = await firebaseAdmin.auth().verifyIdToken(idtoken);

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
      next();
    } else {
      return res.status(400).json(dataResponse(null, 400, "You are not authorized!"));
    }
  });
};
