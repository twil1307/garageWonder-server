import { firebaseAdmin } from "../config/firebase.js";

export const createCustomTokenMiddleware = async (req, res, next) => {
    const token = await firebaseAdmin.auth().createCustomToken("6mWUVceGbsUGhIVkNrib22ansF93")

    req.headers.authorization = "Bearer " + token;
    
    next()
}