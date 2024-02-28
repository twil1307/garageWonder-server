import User from "../models/user.model.js"
import { firebaseAdmin } from "../config/firebase.js";

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
        });

        if(currentUser) {
            req.user = currentUser;
        }

        return next();
    } catch (error) {
        console.log(error);
        return next();
    }
    
};