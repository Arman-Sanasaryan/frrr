const {
  createOrder,
  listOrders,
  updateOrderStatus,
  listMyOrders
} = require("../services/orders.service");

async function createOrderController(req, res) {
  const { cart } = req.body;
  await createOrder({ cart, userId: req.user.id });
  const session = await req.stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: cart.map(item => ({
      price_data: {
        currency: "amd",
        product_data: { name: item.name },
        unit_amount: item.price * 100
      },
      quantity: 1
    })),
    mode: "payment",
    success_url: `${req.staticBaseUrl}/success.html`,
    cancel_url: `${req.staticBaseUrl}/cancel.html`
  });

  res.json({ url: session.url });
}

async function listOrdersController(_req, res) {
  const orders = await listOrders();
  res.json(orders);
}

async function updateOrderStatusController(req, res) {
  await updateOrderStatus({
    id: req.params.id,
    status: req.body.status
  });
  res.send("OK");
}

async function listMyOrdersController(req, res) {
  const orders = await listMyOrders({ userId: req.user.id });
  res.json(orders);
}

module.exports = {
  createOrderController,
  listOrdersController,
  updateOrderStatusController,
  listMyOrdersController
};
