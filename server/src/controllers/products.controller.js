const {
  addProduct,
  deleteProductById,
  listProducts
} = require("../services/products.service");

async function addProductController(req, res) {
  const { name, price } = req.body;
  const product = await addProduct({
    name,
    price,
    imageBaseUrl: req.publicBaseUrl,
    filename: req.file.filename
  });

  res.json(product);
}

async function deleteProductController(req, res) {
  await deleteProductById(req.params.id);
  res.send("Удалено");
}

async function listProductsController(req, res) {
  const { category, price } = req.query;
  const products = await listProducts({ category, price });
  res.json(products);
}

module.exports = {
  addProductController,
  deleteProductController,
  listProductsController
};
