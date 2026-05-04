const {
  addReview,
  listReviewsByProduct
} = require("../services/reviews.service");

async function addReviewController(req, res) {
  const review = await addReview(req.body);
  res.json(review);
}

async function listReviewsController(req, res) {
  const reviews = await listReviewsByProduct(req.params.productId);
  res.json(reviews);
}

module.exports = {
  addReviewController,
  listReviewsController
};
