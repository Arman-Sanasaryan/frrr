import { useContext, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ChatWidget from "../components/ChatWidget";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useProducts } from "../context/ProductsContext";
import { readCart, writeCart, getCartTotal } from "../utils/cart";
import { formatPrice } from "../utils/formatPrice";
import { getDisplayName } from "../utils/displayName";
import categoryConfig from "../data/categoryConfig";

export default function Home() {
  const { user, logout, login, register, startGoogleLogin } =
    useContext(AuthContext);
  const { products, loading: productsLoading } = useProducts();
  const navigate = useNavigate();

  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [price, setPrice] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [lang, setLang] = useState("ru");
  const [cart, setCart] = useState(() => readCart());
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "premium",
  );
  const themes = ["premium", "minimal", "solar"];
  const [cartOpen, setCartOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [subcategory, setSubcategory] = useState("");

  const activeCategory = categoryConfig.find((c) => c.id === category);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    api
      .get("/auth/providers")
      .then((res) => setGoogleAuthEnabled(Boolean(res.data?.google)))
      .catch(() => setGoogleAuthEnabled(false));
  }, []);

  function toggleTheme() {
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  }

  const t = {
    search: lang === "ru" ? "Поиск товаров" : "Search products",
    anyPrice: lang === "ru" ? "Любая цена" : "Any price",
    lowPrice: lang === "ru" ? "До 15000" : "Up to 15000",
    highPrice: lang === "ru" ? "От 15000" : "From 15000",
    popular: lang === "ru" ? "Популярные" : "Popular",
    asc: lang === "ru" ? "Цена ↑" : "Price ↑",
    desc: lang === "ru" ? "Цена ↓" : "Price ↓",
    allProducts: lang === "ru" ? "Все товары" : "All products",
    categories: lang === "ru" ? "Категории" : "Categories",
    all: lang === "ru" ? "Все" : "All",
    guest: lang === "ru" ? "Гость" : "Guest",
    signIn: lang === "ru" ? "Войти" : "Sign in",
    signOut: lang === "ru" ? "Выйти" : "Logout",
    cartTitle: lang === "ru" ? "Корзина" : "Your cart",
    cartEmpty: lang === "ru" ? "Корзина пуста" : "Cart is empty",
    checkout: lang === "ru" ? "Оформить" : "Checkout",
    total: lang === "ru" ? "Итого" : "Total",
    noProducts:
      lang === "ru" ? "Товары не найдены" : "No products match your filters",
    loginTitle: lang === "ru" ? "Вход" : "Sign in",
    registerTitle: lang === "ru" ? "Регистрация" : "Register",
    name: lang === "ru" ? "Имя" : "Name",
    email: lang === "ru" ? "Email" : "Email",
    password: lang === "ru" ? "Пароль" : "Password",
    googleSignIn: lang === "ru" ? "Войти через Google" : "Sign in with Google",
    or: lang === "ru" ? "или" : "or",
    submitLogin: lang === "ru" ? "Войти" : "Sign in",
    submitRegister: lang === "ru" ? "Создать аккаунт" : "Create account",
    switchToRegister:
      lang === "ru" ? "Нет аккаунта? Регистрация" : "No account? Register",
    switchToLogin:
      lang === "ru" ? "Уже есть аккаунт? Войти" : "Have an account? Sign in",
    myOrders: lang === "ru" ? "Мои заказы" : "My orders",
    loadingProducts: lang === "ru" ? "Загрузка товаров…" : "Loading products…",
  };

  const visibleProducts = useMemo(() => {
    let filtered = products;

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (subcategory) {
      filtered = filtered.filter((p) => p.subcategory === subcategory);
    }

    if (search) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (price === "low") {
      filtered = filtered.filter((p) => p.price <= 15000);
    }

    if (price === "high") {
      filtered = filtered.filter((p) => p.price > 15000);
    }

    if (sortBy === "price_asc") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price_desc") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [products, category, subcategory, search, price, sortBy]);

  const cartTotal = getCartTotal(cart);

  function handleAddToCart(product) {
    const next = [...cart, product];
    setCart(next);
    writeCart(next);
  }

  function openAuth(mode = "login") {
    setAuthMode(mode);
    setAuthError("");
    setAuthOpen(true);
  }

  function closeAuth() {
    setAuthOpen(false);
    setAuthName("");
    setAuthEmail("");
    setAuthPassword("");
    setAuthError("");
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      if (authMode === "register") {
        await register(authEmail, authPassword, authName);
        await login(authEmail, authPassword);
      } else {
        await login(authEmail, authPassword);
      }
      closeAuth();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (lang === "ru" ? "Ошибка авторизации" : "Authentication failed");
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  }

  function selectCategory(id) {
    if (category === id) {
      setCategory("");
      setSubcategory("");
      return;
    }
    setCategory(id);
    setSubcategory("");
  }

  return (
    <div>
      <div className="topbar">
        <div className="topbar-user">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="user-avatar"
              referrerPolicy="no-referrer"
            />
          ) : null}
          <span>{user ? getDisplayName(user) : t.guest}</span>
        </div>

        <div className="topbar-actions">
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>

          {user ? (
            <>
              <button type="button" onClick={() => navigate("/orders")}>
                {t.myOrders}
              </button>
              <button type="button" onClick={logout}>
                {t.signOut}
              </button>
            </>
          ) : (
            <button type="button" onClick={() => openAuth("login")}>
              {t.signIn}
            </button>
          )}

          <button type="button" onClick={() => setCartOpen(true)}>
            🛒 {cart.length}
          </button>

          <button type="button" onClick={toggleTheme}>
            {theme === "premium" && "✨ Premium"}
            {theme === "minimal" && "⚪ Minimal"}
            {theme === "solar" && "☀️ Solar"}
          </button>
        </div>
      </div>

      <div className="header">
        <div className="logo">
          <span className="logo-dot"></span>
          <div className="logo-text">Luvé on Store</div>
        </div>

        <input
          className="search"
          placeholder={t.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="shop-layout">
        <aside className="sidebar">
          <div className="sidebar-title">{t.categories}</div>

          <button
            type="button"
            className={`sidecat ${category === "" ? "active" : ""}`}
            onClick={() => {
              setCategory("");
              setSubcategory("");
            }}
          >
            📚 {t.allProducts}
          </button>

          {categoryConfig.map((c) => (
            <div key={c.id}>
              <button
                type="button"
                className={`sidecat ${category === c.id ? "active" : ""}`}
                onClick={() => selectCategory(c.id)}
              >
                <span>
                  {c.icon} {c.label}
                </span>
              </button>

              {category === c.id && (
                <div className="subcategories">
                  {c.sub.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`subcat ${subcategory === s ? "active" : ""}`}
                      onClick={() => setSubcategory(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        <div className="content">
          {activeCategory && (
            <div className="subbar">
              <button
                type="button"
                className={`subbtn ${subcategory === "" ? "active" : ""}`}
                onClick={() => setSubcategory("")}
              >
                {t.all}
              </button>

              {activeCategory.sub.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`subbtn ${subcategory === s ? "active" : ""}`}
                  onClick={() => setSubcategory(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="filters">
            <select value={price} onChange={(e) => setPrice(e.target.value)}>
              <option value="">{t.anyPrice}</option>
              <option value="low">{t.lowPrice}</option>
              <option value="high">{t.highPrice}</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="popular">{t.popular}</option>
              <option value="price_asc">{t.asc}</option>
              <option value="price_desc">{t.desc}</option>
            </select>
          </div>

          {productsLoading ? (
            <p className="empty-products">{t.loadingProducts}</p>
          ) : visibleProducts.length === 0 ? (
            <p className="empty-products">{t.noProducts}</p>
          ) : (
            <div className="grid">
              {visibleProducts.map((p) => (
                <ProductCard key={p._id} p={p} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </div>

      {chatOpen ? (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <span>💬</span>
            <button
              type="button"
              className="chat-panel-close"
              onClick={() => setChatOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          <ChatWidget />
        </div>
      ) : (
        <button
          type="button"
          className="chat"
          onClick={() => setChatOpen(true)}
          aria-label="Open chat"
        >
          💬
        </button>
      )}

      {authOpen && (
        <div className="overlay auth-overlay" onClick={closeAuth}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>{authMode === "login" ? t.loginTitle : t.registerTitle}</h3>
              <button type="button" onClick={closeAuth}>
                ✕
              </button>
            </div>

            {googleAuthEnabled && (
              <>
                <button
                  type="button"
                  className="google-signin"
                  onClick={startGoogleLogin}
                >
                  {t.googleSignIn}
                </button>
                <p className="auth-divider">{t.or}</p>
              </>
            )}

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === "register" && (
                <label>
                  {t.name}
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </label>
              )}

              <label>
                {t.email}
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>

              <label>
                {t.password}
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={
                    authMode === "login" ? "current-password" : "new-password"
                  }
                />
              </label>

              {authError && <p className="auth-error">{authError}</p>}

              <button type="submit" className="checkout" disabled={authLoading}>
                {authLoading
                  ? "..."
                  : authMode === "login"
                    ? t.submitLogin
                    : t.submitRegister}
              </button>
            </form>

            <button
              type="button"
              className="auth-switch"
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setAuthError("");
              }}
            >
              {authMode === "login" ? t.switchToRegister : t.switchToLogin}
            </button>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="overlay" onClick={() => setCartOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>🛒 {t.cartTitle}</h3>
              <button type="button" onClick={() => setCartOpen(false)}>
                ✕
              </button>
            </div>

            <div className="drawer-body">
              {cart.length === 0 ? (
                <p className="muted">{t.cartEmpty}</p>
              ) : (
                cart.map((p, i) => (
                  <div className="cart-item" key={`${p._id}-${i}`}>
                    <span>{p.name}</span>
                    <span>{formatPrice(p.price)}</span>
                  </div>
                ))
              )}
            </div>

            <div className="drawer-footer">
              {cart.length > 0 && (
                <p className="cart-total">
                  {t.total}: {formatPrice(cartTotal)}
                </p>
              )}
              <button
                type="button"
                className="checkout"
                disabled={cart.length === 0}
                onClick={() => navigate("/checkout")}
              >
                {t.checkout}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
