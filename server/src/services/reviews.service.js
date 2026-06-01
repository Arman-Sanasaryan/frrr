const Review = require("../repositories/review.repository");

async function addReview(payload) {
  return Review.insert(payload);
}

function listReviewsByProduct(productId) {
  return Review.findByProductId(productId);
}

module.exports = {
  addReview,
  listReviewsByProduct
};
