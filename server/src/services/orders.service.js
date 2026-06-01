const Order = require("../repositories/order.repository");

async function createOrder({ cart, userId }) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  return Order.insert({
    items: cart,
    total,
    userId: String(userId)
  });
}

function createPaidOrderFromSession({ session }) {
  return Order.insert({
    items: JSON.parse(session.metadata.cart),
    total: session.amount_total / 100,
    status: "оплачен"
  });
}

function listOrders() {
  return Order.findAllSorted();
}

function updateOrderStatus({ id, status }) {
  return Order.updateStatus(id, status);
}

function listMyOrders({ userId }) {
  return Order.findByUserId(userId);
}

module.exports = {
  createOrder,
  createPaidOrderFromSession,
  listOrders,
  updateOrderStatus,
  listMyOrders
};
