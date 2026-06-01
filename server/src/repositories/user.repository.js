const { getDb } = require("../db");
const { parseUserRow } = require("../db/rowMappers");

function findById(id) {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id);
  return parseUserRow(row);
}

function findOne({ email }) {
  const row = getDb()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);
  return parseUserRow(row);
}

function findByGoogleId(googleId) {
  const row = getDb()
    .prepare("SELECT * FROM users WHERE google_id = ?")
    .get(googleId);
  return parseUserRow(row);
}

function insert({ email, password, name, googleId, avatarUrl }) {
  const result = getDb()
    .prepare(
      `INSERT INTO users (email, password, name, google_id, avatar_url)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      email,
      password || "",
      name || null,
      googleId || null,
      avatarUrl || null
    );

  return findById(result.lastInsertRowid);
}

function updateProfile(id, { name, googleId, avatarUrl }) {
  getDb()
    .prepare(
      `UPDATE users
       SET name = COALESCE(?, name),
           google_id = COALESCE(?, google_id),
           avatar_url = COALESCE(?, avatar_url)
       WHERE id = ?`
    )
    .run(name ?? null, googleId ?? null, avatarUrl ?? null, id);

  return findById(id);
}

function upsertGoogleUser({ googleId, email, name, avatarUrl }) {
  let user = findByGoogleId(googleId);
  if (!user) {
    user = findOne({ email });
  }

  if (user) {
    return updateProfile(user._id, {
      name: name || user.name,
      googleId,
      avatarUrl: avatarUrl || user.avatarUrl
    });
  }

  return insert({
    email,
    password: "",
    name,
    googleId,
    avatarUrl
  });
}

module.exports = {
  findById,
  findOne,
  findByGoogleId,
  insert,
  updateProfile,
  upsertGoogleUser
};
