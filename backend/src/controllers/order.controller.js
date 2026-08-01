import { withTransaction } from "../config/database.js";
import { OrderModel, OrderItemModel, CartItemModel, ProductModel } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { requireDoubleConfirmation } from "../middleware/doubleConfirm.middleware.js";

// POST /api/orders  (checkout - place order from current cart)
export const createOrder = catchAsync(async (req, res) => {
  const { shippingAddress, phone, paymentMethod, notes } = req.body;
  const userId = req.user.id;

  const order = await withTransaction(async (client) => {
    // FOR UPDATE
    const cartItems = await CartItemModel.findByUser(userId);

    if (cartItems.length === 0) {
      throw ApiError.badRequest("Cart is empty, cannot place order");
    }

    for (const item of cartItems) {
      if (!item.is_active) {
        throw ApiError.badRequest(`One of the products is no longer available`);
      }
      if (item.stock < item.quantity) {
        throw ApiError.badRequest(`The available quantity of "${item.name}" is not sufficient`);
      }
    }

    const totalPrice = cartItems.reduce((sum, item) => {
      const price = item.sale_price || item.price;
      return sum + Number(price) * item.quantity;
    }, 0);

    const newOrder = await OrderModel.create(
      { userId, totalPrice, shippingAddress, phone, paymentMethod, notes },
      client
    );

    for (const item of cartItems) {
      await OrderItemModel.create(
        {
          orderId: newOrder.id,
          productId: item.product_id,
          productName: item.name,
          quantity: item.quantity,
          price: item.sale_price || item.price,
        },
        client
      );

      await ProductModel.decrementStock(item.product_id, item.quantity, client);
    }

    await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    return newOrder;
  });

  new ApiResponse(201, { order }, "Order created successfully").send(res);
});

// GET /api/orders/my-orders
export const getMyOrders = catchAsync(async (req, res) => {
  const orders = await OrderModel.findByUser(req.user.id);
  const ordersWithItems = await Promise.all(
    orders.map(async (order) => ({ ...order, items: await OrderItemModel.findByOrder(order.id) }))
  );
  new ApiResponse(200, { orders: ordersWithItems }, "My Orders").send(res);
});

// GET /api/orders/:id
export const getOrderById = catchAsync(async (req, res) => {
  const order = req.user.role === "admin"
    ? await OrderModel.findById(req.params.id)
    : await OrderModel.findByIdForUser(req.params.id, req.user.id);

  if (!order) throw ApiError.notFound("Order not found");

  const items = await OrderItemModel.findByOrder(order.id);
  new ApiResponse(200, { order: { ...order, items } }).send(res);
});

// GET /api/orders  (admin - all orders)
export const getAllOrders = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const { rows, total } = await OrderModel.findAll({ status, limit: Number(limit), offset });
  const ordersWithItems = await Promise.all(
    rows.map(async (order) => ({ ...order, items: await OrderItemModel.findByOrder(order.id) }))
  );

  new ApiResponse(200, {
    orders: ordersWithItems,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  }, "All Orders").send(res);
});

// PATCH /api/orders/:id/status  (admin) — DOUBLE CONFIRMATION REQUIRED
export const updateOrderStatus = [
  catchAsync(async (req, res, next) => {
    const order = await OrderModel.findById(req.params.id);
    if (!order) throw ApiError.notFound("Order not found");
    req.targetResource = { ...order, newStatus: req.body.status };
    next();
  }),
  requireDoubleConfirmation(
    "update-order-status",
    (order) => `Are you sure you want to change the order status to "${order.newStatus}"?`
  ),
  catchAsync(async (req, res) => {
    const order = await OrderModel.updateStatus(req.targetResource.id, req.body.status);
    new ApiResponse(200, { order }, "Order status updated successfully").send(res);
  }),
];

// PATCH /api/orders/:id/cancel  (user cancels own pending order) — DOUBLE CONFIRMATION REQUIRED
export const cancelOrder = [
  catchAsync(async (req, res, next) => {
    const order = await OrderModel.findByIdForUser(req.params.id, req.user.id);
    if (!order) throw ApiError.notFound("Order not found");
    if (!["pending", "confirmed"].includes(order.status)) {
      throw ApiError.badRequest("Cannot cancel order at this stage");
    }
    req.targetResource = order;
    next();
  }),
  requireDoubleConfirmation("cancel-order", () => "Are you sure you want to cancel this order? This action cannot be undone."),
  catchAsync(async (req, res) => {
    const orderId = req.targetResource.id;

    const order = await withTransaction(async (client) => {
      const items = await OrderItemModel.findByOrder(orderId);
      for (const item of items) {
        await ProductModel.incrementStock(item.product_id, item.quantity, client);
      }
      return OrderModel.updateStatus(orderId, "cancelled", client);
    });

    new ApiResponse(200, { order }, "Order cancelled successfully").send(res);
  }),
];
