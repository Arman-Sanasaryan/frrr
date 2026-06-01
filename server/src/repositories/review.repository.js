const { getDb } = require("../db");
const { parseReviewRow } = require("../db/rowMappers");

function insert({ productId, text, rating }) {
  const result = getDb()
    .prepare(
      "INSERT INTO reviews (product_id, text, rating) VALUES (?, ?, ?)"
    )
    .run(productId, text || null, rating ?? null);

  return parseReviewRow({
    id: result.lastInsertRowid,
    product_id: productId,
    text,
    rating
  });
}

function findByProductId(productId) {
  return getDb()
    .prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC")
    .all(String(productId))
    .map(parseReviewRow);
}

module.exports = { insert, findByProductId };
