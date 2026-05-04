const mongoose = require("mongoose");

const Review = mongoose.model("Review", {
  productId: String,
  text: String,
  rating: Number
});

module.exports = Review;
