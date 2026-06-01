const { getDb } = require("../db");
const { parseUserRow } = require("../db/rowMappers");

function findOne({ email }) {
  const row = getDb()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);
  return parseUserRow(row);
}

function insert({ email, password }) {
  const result = getDb()
    .prepare("INSERT INTO users (email, password) VALUES (?, ?)")
    .run(email, password);
  return parseUserRow({
    id: result.lastInsertRowid,
    email,
    password
  });
}

module.exports = { findOne, insert };
