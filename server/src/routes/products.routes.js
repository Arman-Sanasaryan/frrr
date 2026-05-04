const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  addProductController,
  deleteProductController,
  listProductsController
} = require("../controllers/products.controller");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

function createProductsRouter({ auth, publicBaseUrl }) {
  const router = express.Router();

  router.use((req, _res, next) => {
    req.publicBaseUrl = publicBaseUrl;
    next();
  });

  router.post("/add-product", auth, upload.single("image"), addProductController);
  router.delete("/delete-product/:id", auth, deleteProductController);
  router.get("/products", listProductsController);

  return router;
}

module.exports = { createProductsRouter };
