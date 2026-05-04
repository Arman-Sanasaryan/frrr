const mongoose = require("mongoose");

const Order = mongoose.model("Order", {
  items: Array,
  total: Number,
  status: { type: String, default: "новый" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = Order;
