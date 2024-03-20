import { Router } from "express";
import {
  createNewBrand,
  getAllBrands,
} from "../controller/brand.controller.js";
import { hasRole } from "../middleware/userAuthMiddleware.js";
import { ADMIN, USER } from "../enum/role.enum.js";
import { processService } from "../helper/service.helper.js";
import mongoose from "mongoose";
var router = Router();

router.get("/sth", async (req, res, next) => {
  const data = {
    "65f978a2ed3cc9a199e9ab59": [
      mongoose.Types.ObjectId("65f85728b357ad65c9b51cc0"),
      mongoose.Types.ObjectId("65f85728b357ad65c9b51cc1"),
    ],
    "65f978a2ed3cc9a199e9ab50": [
      mongoose.Types.ObjectId("65de23dd9664a471253edb61"),
    ],
  };

  const result = await processService(data);

  return res.status(200).json({
    data: result,
  });
});

router.get("/", getAllBrands);

router.post("/", createNewBrand);

export default router;
