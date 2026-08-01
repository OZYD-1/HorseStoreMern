import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import categoryRoutes from "./category.routes.js";
import cartRoutes from "./cart.routes.js";
import favoriteRoutes from "./favorite.routes.js";
import orderRoutes from "./order.routes.js";
import blogRoutes from "./blog.routes.js";
import adminRoutes from "./admin.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/cart", cartRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/orders", orderRoutes);
router.use("/blogs", blogRoutes);
router.use("/admin", adminRoutes);
router.use("/users", userRoutes);

export default router;
