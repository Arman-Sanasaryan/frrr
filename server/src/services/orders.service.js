const Order = require("../models/order.model");

async function createOrder({ cart }) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const order = new Order({
    items: cart,
    total
  });
  await order.save();
  return order;
}

function createPaidOrderFromSession({ session }) {
  const order = new Order({
    items: JSON.parse(session.metadata.cart),
    total: session.amount_total / 100,
    status: "оплачен"
  });
  return order.save();
}

function listOrders() {
  return Order.find().sort({ createdAt: -1 });
}

function updateOrderStatus({ id, status }) {
  return Order.findByIdAndUpdate(id, { status });
}

function listMyOrders({ userId }) {
  return Order.find({ userId });
}

module.exports = {
  createOrder,
  createPaidOrderFromSession,
  listOrders,
  updateOrderStatus,
  listMyOrders
};
