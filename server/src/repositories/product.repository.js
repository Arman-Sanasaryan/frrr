const { getDb } = require("../db");
const { parseProductRow } = require("../db/rowMappers");

function count() {
  return getDb().prepare("SELECT COUNT(*) AS total FROM products").get().total;
}

function findById(id) {
  const row = getDb().prepare("SELECT * FROM products WHERE id = ?").get(id);
  return parseProductRow(row);
}

function insert({ name, price, image, category, subcategory }) {
  const result = getDb()
    .prepare(
      `INSERT INTO products (name, price, image, category, subcategory)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(name, price, image || null, category || null, subcategory || null);

  return parseProductRow({
    id: result.lastInsertRowid,
    name,
    price,
    image,
    category,
    subcategory
  });
}

function deleteById(id) {
  getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
}

function findAll({ category, price } = {}) {
  let sql = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  if (price === "low") {
    sql += " AND price <= ?";
    params.push(5000);
  }
  if (price === "high") {
    sql += " AND price >= ?";
    params.push(5000);
  }

  sql += " ORDER BY id DESC";

  return getDb()
    .prepare(sql)
    .all(...params)
    .map(parseProductRow);
}

module.exports = { count, findById, insert, deleteById, findAll };
