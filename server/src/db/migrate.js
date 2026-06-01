function columnExists(database, table, column) {
  const columns = database.prepare(`PRAGMA table_info(${table})`).all();
  return columns.some((col) => col.name === column);
}

function migrateUsersTable(database) {
  if (!columnExists(database, "users", "name")) {
    database.exec("ALTER TABLE users ADD COLUMN name TEXT");
  }
  if (!columnExists(database, "users", "google_id")) {
    database.exec("ALTER TABLE users ADD COLUMN google_id TEXT");
  }
  if (!columnExists(database, "users", "avatar_url")) {
    database.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT");
  }

  database.exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL"
  );
}

module.exports = { migrateUsersTable };
