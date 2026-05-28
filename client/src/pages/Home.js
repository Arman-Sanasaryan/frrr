import { useContext, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { AuthContext } from "../context/AuthContext";
import { readCart, writeCart } from "../utils/cart";
import demoProducts from "../data/Products";
import categoryConfig from "../data/categoryConfig";
import { useEffect } from "react";

export default function Home() {
  const { user, logout } = useContext(AuthContext);

  // ===== STATE =====
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [price, setPrice] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [lang, setLang] = useState("ru");
  const [cart, setCart] = useState(() => readCart());
  const [theme, setTheme] = useState(() => {
  return localStorage.getItem("theme") || "premium";
});
  const themes = ["premium", "minimal", "solar"];
  const [cartOpen, setCartOpen] = useState(false);
  const [subcategory, setSubcategory] = useState("");

useEffect(() => {
  document.body.setAttribute("data-theme", theme);
}, [theme]);

  function toggleTheme() {
  const currentIndex = themes.indexOf(theme);
  const nextTheme = themes[(currentIndex + 1) % themes.length];

  setTheme(nextTheme);
  localStorage.setItem("theme", nextTheme);
}

  // ===== TRANSLATIONS (простые) =====
  const t = {
    search: lang === "ru" ? "Поиск товаров" : "Search products",
    anyPrice: lang === "ru" ? "Любая цена" : "Any price",
    lowPrice: lang === "ru" ? "До 15000" : "Up to 15000",
    highPrice: lang === "ru" ? "От 15000" : "From 15000",
    popular: lang === "ru" ? "Популярные" : "Popular",
    asc: lang === "ru" ? "Цена ↑" : "Price ↑",
    desc: lang === "ru" ? "Цена ↓" : "Price ↓",
  };

  // ===== FILTERS =====
  const visibleProducts = useMemo(() => {
    let filtered = demoProducts;

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (subcategory) {
  filtered = filtered.filter(
    (p) => p.subcategory === subcategory
  );
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
  }, [category, subcategory, search, price, sortBy]);

  // ===== CART =====
  function handleAddToCart(product) {
    const next = [...cart, product];
    setCart(next);
    writeCart(next);
  }

  function openCart() {
    setCartOpen(true);
  }

  function changeLanguage(l) {
    setLang(l);
  }

  // ===== UI =====
  return (
    <div>
      {/* TOP BAR */}
      <div className="topbar">
        <div>{user?.email || "Guest"}</div>

        <div style={{ display: "flex", gap: 10 }}>
          <select value={lang} onChange={(e) => changeLanguage(e.target.value)}>
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>

          {user ? (
            <button onClick={logout}>Logout</button>
          ) : (
            <button>Sign in</button>
          )}

          <button onClick={openCart}>🛒 {cart.length}</button>
          <button onClick={toggleTheme}>
  {theme === "premium" && "✨ Premium"}
  {theme === "minimal" && "⚪ Minimal"}
  {theme === "solar" && "☀️ Solar"}
</button>
        </div>
      </div>

      {/* HEADER */}
      <div className="header">
        <div className="logo">
          <span className="logo-dot"></span>
          Luvé on Store
        </div>

        <input
          className="search"
          placeholder={t.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* CATEGORY BAR */}
      <div className="shop-layout">

  {/* SIDEBAR */}
  <aside className="sidebar">

    <div className="sidebar-title">
      Categories
    </div>

    <button
      className={`sidecat ${category === "" ? "active" : ""}`}
      onClick={() => {
        setCategory("");
        setSubcategory("");
      }}
    >
      📚 All Products
    </button>

    {categoryConfig.map((c) => (
      <div key={c.id}>

        <button
          className={`sidecat ${
            category === c.id ? "active" : ""
          }`}
          onClick={() => {
  if (category === c.id) {
    setCategory("");
    setSubcategory("");
  } else {
    setCategory(c.id);
    setSubcategory("");
  }
}}
        >
          <span>
            {c.icon} {c.label}
          </span>
        </button>

        {/* SUBCATEGORIES */}
        {category === c.id && (
          <div className="subcategories">

            {c.sub.map((s) => (
              <button
                key={s}
                className={`subcat ${
                  subcategory === s ? "active" : ""
                }`}
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

  {/* PRODUCTS */}
  <div className="content">

    <div className="filters">
      <select
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      >
        <option value="">{t.anyPrice}</option>
        <option value="low">{t.lowPrice}</option>
        <option value="high">{t.highPrice}</option>
      </select>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="popular">{t.popular}</option>
        <option value="price_asc">{t.asc}</option>
        <option value="price_desc">{t.desc}</option>
      </select>
    </div>

    <div className="grid">
      {visibleProducts.map((p) => (
        <ProductCard
          key={p._id}
          p={p}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>

  </div>
</div>

      {category && (
  <div className="subbar">

    <button
      className={`subbtn ${subcategory === "" ? "active" : ""}`}
      onClick={() => setSubcategory("")}
    >
      Все
    </button>

    {categoryConfig
      .find((c) => c.id === category)
      ?.sub.map((s) => (
        <button
          key={s}
          className={`subbtn ${subcategory === s ? "active" : ""}`}
          onClick={() => setSubcategory(s)}
        >
          {s}
        </button>
      ))}
  </div>
)}

      {/* FILTERS */}
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

      {/* PRODUCTS */}
      <div className="grid">
        {visibleProducts.map((p) => (
          <ProductCard key={p._id} p={p} onAddToCart={handleAddToCart} />
        ))}
      </div>

      {/* CHAT */}

      <div className="chat">💬</div>

      {cartOpen && (
        <div className="overlay" onClick={() => setCartOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>🛒 Your Cart</h3>
              <button onClick={() => setCartOpen(false)}>✕</button>
            </div>

            <div className="drawer-body">
              {cart.length === 0 ? (
                <p className="muted">Cart is empty</p>
              ) : (
                cart.map((p, i) => (
                  <div className="cart-item" key={i}>
                    <span>{p.name}</span>
                    <span>${p.price}</span>
                  </div>
                ))
              )}
            </div>

            <div className="drawer-footer">
              <button className="checkout">Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
