require("dotenv").config();
import { Types } from "mongoose";

export default (req, res, next) => {
  try {
    const userId = Types.ObjectId(req.params.userId);
    const userObjId = req.user._id;

    if (!userId.equals(userObjId)) {
      return res
        .status(401)
        .json({ error: "You are not authorized to access this" });
    } else {
      next();
    }
  } catch (error) {
    return res.status(404).json({
      error: "No user found",
    });
  }
};
