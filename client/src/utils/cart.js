const CART_KEY = "cartItems";

export function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

export function getCartTotal(items) {
  return items.reduce((sum, item) => sum + Number(item.price || 0), 0);
}
