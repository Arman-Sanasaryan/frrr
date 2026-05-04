const Review = require("../models/review.model");

async function addReview(payload) {
  const review = new Review(payload);
  await review.save();
  return review;
}

function listReviewsByProduct(productId) {
  return Review.find({ productId });
}

module.exports = {
  addReview,
  listReviewsByProduct
};
