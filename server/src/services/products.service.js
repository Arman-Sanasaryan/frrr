const Product = require("../models/product.model");

async function addProduct({ name, price, imageBaseUrl, filename }) {
  const product = new Product({
    name,
    price,
    image: `${imageBaseUrl}/uploads/` + filename
  });
  await product.save();
  return product;
}

function deleteProductById(id) {
  return Product.findByIdAndDelete(id);
}

function listProducts({ category, price }) {
  const filter = {};

  if (category) filter.category = category;
  if (price === "low") filter.price = { $lte: 5000 };
  if (price === "high") filter.price = { $gte: 5000 };

  return Product.find(filter);
}

module.exports = {
  addProduct,
  deleteProductById,
  listProducts
};
