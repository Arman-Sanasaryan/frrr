const Product = require("../repositories/product.repository");

async function addProduct({ name, price, imageBaseUrl, filename, category, subcategory }) {
  return Product.insert({
    name,
    price,
    image: `${imageBaseUrl}/uploads/${filename}`,
    category,
    subcategory
  });
}

function deleteProductById(id) {
  return Product.deleteById(id);
}

function listProducts({ category, price }) {
  return Product.findAll({ category, price });
}

function getProductById(id) {
  return Product.findById(id);
}

module.exports = {
  addProduct,
  deleteProductById,
  listProducts,
  getProductById
};
