import { Router } from "express";
import {
  createNewBrand,
  getAllBrands,
} from "../controller/brand.controller.js";
import { hasRole } from "../middleware/userAuthMiddleware.js";
import { ADMIN, USER } from "../enum/role.enum.js";
var router = Router();

router.get("/", getAllBrands);

router.post("/", createNewBrand);

export default router;
