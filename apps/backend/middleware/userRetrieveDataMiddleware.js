import User from "../models/user.model.js"
import { firebaseAdmin } from "../config/firebase.js";
import dataResponse from "../utils/dataResponse.js";

export const retrieveUserDataMiddleware = async (req, res, next) => {
    try {
        const { authorization } = req.headers;

        if(!authorization) {
            return next();
        }

        const token = authorization.replace("Bearer ", "");

        const userLoginId = await firebaseAdmin.auth().verifyIdToken(token);

        if(!userLoginId) {
            return next();
        }
        
        const currentUser = await User.findOne({
            uid: userLoginId.uid
            // uid: "piuZhHzIZMhQoBrrqoygav2GyTx2"
        });

        console.log(currentUser);

        if(currentUser) {
            req.user = currentUser;
        }

        return next();
    } catch (error) {
        console.log(error);
        return res.status(401).json(dataResponse({}, 401, "Unauthorized"));
    }
};