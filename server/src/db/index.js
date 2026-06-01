const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { env } = require("../config/env");
const { migrateUsersTable } = require("./migrate");

let db = null;

function getDbPath() {
  return env.SQLITE_PATH;
}

function initSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL DEFAULT '',
      name TEXT,
      google_id TEXT,
      avatar_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      category TEXT,
      subcategory TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      user_id TEXT,
      status TEXT NOT NULL DEFAULT 'новый',
      payment_method TEXT,
      crypto_currency TEXT,
      crypto_amount REAL,
      wallet_address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      text TEXT,
      rating INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function initDatabase() {
  if (db) {
    return db;
  }

  const dbPath = getDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL");
  initSchema(db);
  migrateUsersTable(db);

  console.log(`SQLite database: ${dbPath}`);
  return db;
}

function isDatabaseReady() {
  return Boolean(db);
}

function getDb() {
  if (!db) {
    throw new Error("Database is not initialized");
  }
  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  initDatabase,
  isDatabaseReady,
  getDb,
  closeDatabase,
  getDbPath
};
