import { ProductModel, CategoryModel, UserModel, OrderModel } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/apiResponse.js";

// GET /api/admin/dashboard  (admin only)
export const getDashboardStats = catchAsync(async (req, res) => {
  const [productsCount, categoriesCount, usersCount, ordersCount, pendingOrders, lowStock, totalRevenue, recentOrders] =
    await Promise.all([
      ProductModel.count(),
      CategoryModel.count(),
      UserModel.count(),
      OrderModel.count(),
      OrderModel.countByStatus("pending"),
      ProductModel.countLowStock(5),
      OrderModel.sumRevenue(),
      OrderModel.recent(5),
    ]);

  new ApiResponse(200, {
    stats: {
      productsCount, categoriesCount, usersCount, ordersCount,
      pendingOrders, lowStockProducts: lowStock, totalRevenue,
    },
    recentOrders,
  }, "control panel").send(res);
});
