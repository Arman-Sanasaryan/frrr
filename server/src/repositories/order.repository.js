const { getDb } = require("../db");
const { parseOrderRow } = require("../db/rowMappers");

function insert(order) {
  const result = getDb()
    .prepare(
      `INSERT INTO orders (
        items, total, user_id, status,
        payment_method, crypto_currency, crypto_amount, wallet_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      JSON.stringify(order.items),
      order.total,
      order.userId || null,
      order.status || "новый",
      order.paymentMethod || null,
      order.cryptoCurrency || null,
      order.cryptoAmount ?? null,
      order.walletAddress || null
    );

  return parseOrderRow(
    getDb().prepare("SELECT * FROM orders WHERE id = ?").get(result.lastInsertRowid)
  );
}

function findAllSorted() {
  return getDb()
    .prepare("SELECT * FROM orders ORDER BY datetime(created_at) DESC")
    .all()
    .map(parseOrderRow);
}

function findByUserId(userId) {
  return getDb()
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY datetime(created_at) DESC")
    .all(String(userId))
    .map(parseOrderRow);
}

function updateStatus(id, status) {
  getDb().prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  return parseOrderRow(getDb().prepare("SELECT * FROM orders WHERE id = ?").get(id));
}

module.exports = { insert, findAllSorted, findByUserId, updateStatus };
