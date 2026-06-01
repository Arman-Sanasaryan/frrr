export function getDisplayName(user) {
  if (!user) {
    return "";
  }
  const name = String(user.name || "").trim();
  if (name) {
    return name;
  }
  if (user.email) {
    return user.email.split("@")[0];
  }
  return "";
}
