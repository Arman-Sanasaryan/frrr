const Product = require("../repositories/product.repository");
const { buildDemoProducts } = require("../data/demoProducts");

function seedProductsIfEmpty() {
  const count = Product.count();
  if (count > 0) {
    return count;
  }

  const items = buildDemoProducts();
  for (const item of items) {
    Product.insert(item);
  }

  console.log(`Seeded ${items.length} demo products into SQLite`);
  return items.length;
}

module.exports = { seedProductsIfEmpty };
