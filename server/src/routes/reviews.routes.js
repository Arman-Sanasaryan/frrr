const express = require("express");
const {
  addReviewController,
  listReviewsController
} = require("../controllers/reviews.controller");

function createReviewsRouter() {
  const router = express.Router();
  router.post("/add-review", addReviewController);
  router.get("/reviews/:productId", listReviewsController);
  return router;
}

module.exports = { createReviewsRouter };
