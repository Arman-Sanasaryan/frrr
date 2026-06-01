const express = require("express");
const {
  createOrderController,
  listOrdersController,
  updateOrderStatusController,
  listMyOrdersController
} = require("../controllers/orders.controller");

function createOrdersRouter({ auth, stripe, publicBaseUrl }) {
  const router = express.Router();

  router.use((req, _res, next) => {
    req.stripe = stripe;
    req.publicBaseUrl = publicBaseUrl;
    next();
  });

  router.get("/my-orders", auth, listMyOrdersController);
  router.post("/create-order", auth, createOrderController);
  router.get("/orders", auth, listOrdersController);
  router.put("/order/:id", auth, updateOrderStatusController);

  return router;
}

module.exports = { createOrdersRouter };
