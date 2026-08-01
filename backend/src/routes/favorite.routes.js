import { Router } from "express";
import * as favoriteController from "../controllers/favorite.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protect);

router.get("/", favoriteController.getFavorites);
router.post("/", favoriteController.addFavorite);
router.delete("/:productId", favoriteController.removeFavorite);

export default router;
