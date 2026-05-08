import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import ChatWidget from "../components/ChatWidget";
import { getCartTotal, readCart, writeCart } from "../utils/cart";
import { AuthContext } from "../context/AuthContext";

const categoryConfig = [
  { id: "clothes", label: "Одежда", icon: "👗", basePrice: 18000 },
  { id: "tech", label: "Техника", icon: "📱", basePrice: 42000 },
  { id: "beauty", label: "Красота", icon: "💄", basePrice: 14500 },
  { id: "home", label: "Дом", icon: "🏠", basePrice: 16500 },
  { id: "food", label: "Гастрономия", icon: "🥐", basePrice: 9500 },
  { id: "sport", label: "Спорт", icon: "🏃", basePrice: 21000 },
  { id: "kids", label: "Детям", icon: "🧸", basePrice: 12000 },
  { id: "accessories", label: "Аксессуары", icon: "👜", basePrice: 17000 }
];

const productNouns = [
  "Selection",
  "Edition",
  "Premium",
  "Atelier",
  "Collection",
  "Studio",
  "Signature",
  "Classique"
];

const productNames = [
  "Noir",
  "Rouge",
  "Luxe",
  "Velvet",
  "Pure",
  "Modern",
  "Nova",
  "Royal",
  "Urban",
  "Silk",
  "Elite",
  "Prime",
  "Pearl"
];

function makeDemoProducts() {
  return Array.from({ length: 120 }, (_, index) => {
    const category = categoryConfig[index % categoryConfig.length];
    const title = `${category.label} ${productNames[index % productNames.length]} ${productNouns[index % productNouns.length]}`;
    const price = category.basePrice + ((index * 1370) % 26000);
    const isHot = index % 3 === 0;
    const isNew = index % 5 === 0;
    let badge = "";

    if (isHot) badge = "Хит";
    else if (isNew) badge = "Новинка";

    return {
      _id: `demo-${index + 1}`,
      name: title,
      subtitle: `Премиум качество для категории "${category.label.toLowerCase()}"`,
      category: category.id,
      price,
      badge,
      image: `https://picsum.photos/seed/premium-${index + 1}/640/480`
    };
  });
}

const demoProducts = makeDemoProducts();
const translations = {
  ru: {
    promoPill: "Premium membership -15% на первую покупку",
    signIn: "Sign in",
    register: "Register",
    logout: "Logout",
    authError: "Ошибка авторизации. Проверьте email и пароль.",
    loggedIn: "Вы успешно вошли.",
    registered: "Регистрация успешна. Теперь войдите.",
    authClose: "Закрыть",
    authCreate: "Создать аккаунт",
    authLogin: "Войти",
    heroTitle: "Premium Store Experience",
    heroText: "100+ товаров, быстрая доставка, возврат до 30 дней.",
    cart: "Корзина",
    ad1Title: "Flash Sale 48h",
    ad1Text: "До -40% на выбранные коллекции",
    ad2Title: "Luxury Brands",
    ad2Text: "Gucci, Prada, Dior",
    ad3Title: "Free Express",
    ad3Text: "На заказы от 25 000 AMD",
    trust1: "Оригинальные бренды",
    trust2: "Доставка за 24 часа",
    trust3: "Оплата при получении",
    search: "Поиск товаров",
    allCategories: "Все категории",
    clothes: "Одежда",
    tech: "Техника",
    beauty: "Красота",
    home: "Дом",
    food: "Гастрономия",
    anyPrice: "Любая цена",
    lowPrice: "До 15000",
    highPrice: "От 15000",
    popular: "Сначала популярные",
    asc: "Цена по возрастанию",
    desc: "Цена по убыванию",
    byName: "По названию",
    loading: "Загрузка товаров...",
    noProducts: "Товаров пока нет.",
    added: "Товар добавлен в корзину.",
    goCart: "Перейти в корзину"
  },
  en: {
    promoPill: "Premium membership -15% on first order",
    signIn: "Sign in",
    register: "Register",
    logout: "Logout",
    authError: "Authorization failed. Check your email and password.",
    loggedIn: "Signed in successfully.",
    registered: "Registration complete. Please sign in.",
    authClose: "Close",
    authCreate: "Create account",
    authLogin: "Sign in",
    heroTitle: "Premium Store Experience",
    heroText: "100+ items, fast delivery, 30-day returns.",
    cart: "Cart",
    ad1Title: "Flash Sale 48h",
    ad1Text: "Up to -40% on selected collections",
    ad2Title: "Luxury Brands",
    ad2Text: "Gucci, Prada, Dior",
    ad3Title: "Free Express",
    ad3Text: "For orders above 25,000 AMD",
    trust1: "Authentic brands",
    trust2: "24-hour delivery",
    trust3: "Pay on delivery",
    search: "Search products",
    allCategories: "All categories",
    clothes: "Clothes",
    tech: "Tech",
    beauty: "Beauty",
    home: "Home",
    food: "Grocery",
    anyPrice: "Any price",
    lowPrice: "Up to 15000",
    highPrice: "From 15000",
    popular: "Most popular first",
    asc: "Price low to high",
    desc: "Price high to low",
    byName: "By name",
    loading: "Loading products...",
    noProducts: "No products yet.",
    added: "Item added to cart.",
    goCart: "Go to cart"
  }
};

export default function Home() {
  const navigate = useNavigate();
  const { user, login, register, logout } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [cart, setCart] = useState(() => readCart());
  const [sortBy, setSortBy] = useState("popular");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "ru");
  const t = translations[lang] || translations.ru;

  useEffect(() => {
    let isMounted = true;

    api
      .get(`/products?category=${category}&price=${price}`)
      .then(res => {
        if (isMounted) {
          const apiProducts = Array.isArray(res.data) ? res.data : [];
          if (apiProducts.length > 0) {
            setProducts(apiProducts);
            setIsUsingDemoData(false);
          } else {
            setProducts(demoProducts);
            setIsUsingDemoData(true);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setProducts(demoProducts);
          setIsUsingDemoData(true);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [category, price]);

  const total = useMemo(() => getCartTotal(cart), [cart]);
  const categoryStats = useMemo(
    () =>
      categoryConfig.map(item => ({
        ...item,
        count: demoProducts.filter(p => p.category === item.id).length
      })),
    []
  );

  const visibleProducts = useMemo(() => {
    let filtered = products.filter(item => {
      const searchMatch =
        !search ||
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(search.toLowerCase());

      if (!searchMatch) {
        return false;
      }

      if (!isUsingDemoData) {
        return true;
      }

      const categoryMatch = !category || item.category === category;
      const priceValue = Number(item.price || 0);
      const priceMatch =
        !price || (price === "low" ? priceValue <= 15000 : priceValue >= 15000);
      return categoryMatch && priceMatch;
    });

    if (sortBy === "price_asc") {
      filtered = [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price_desc") {
      filtered = [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      filtered = [...filtered].sort((a, b) => {
        const aScore = (a.badge ? 10 : 0) + Number(a.price);
        const bScore = (b.badge ? 10 : 0) + Number(b.price);
        return bScore - aScore;
      });
    }

    return filtered;
  }, [category, isUsingDemoData, price, products, search, sortBy]);

  function handleAddToCart(product) {
    setCart(prev => {
      const next = [...prev, product];
      writeCart(next);
      return next;
    });
    setMessage(t.added);
  }

  function openCart() {
    navigate("/cart");
  }

  async function submitAuth() {
    try {
      if (authMode === "signin") {
        await login(authForm.email, authForm.password);
        setMessage(t.loggedIn);
      } else {
        await register(authForm.email, authForm.password);
        setMessage(t.registered);
        setAuthMode("signin");
      }
      setAuthOpen(false);
      setAuthForm({ email: "", password: "" });
    } catch {
      setMessage(t.authError);
    }
  }

  function changeLanguage(nextLang) {
    setLang(nextLang);
    localStorage.setItem("lang", nextLang);
  }

  return (
    <div className="page">
      <div className="top-auth-bar">
        <div className="promo-pill">{t.promoPill}</div>
        <div className="auth-mini">
          <select
            className="language-select"
            value={lang}
            onChange={e => changeLanguage(e.target.value)}
          >
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>
          {user ? (
            <>
              <span>{user.email}</span>
              <button onClick={logout}>{t.logout}</button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setAuthMode("signin");
                  setAuthOpen(true);
                }}
              >
                {t.signIn}
              </button>
              <button
                onClick={() => {
                  setAuthMode("register");
                  setAuthOpen(true);
                }}
              >
                {t.register}
              </button>
            </>
          )}
        </div>
      </div>

      {authOpen ? (
        <div className="auth-popup">
          <h4>{authMode === "signin" ? t.signIn : t.register}</h4>
          <input
            type="email"
            placeholder="Email"
            value={authForm.email}
            onChange={e => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
          />
          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={e =>
              setAuthForm(prev => ({ ...prev, password: e.target.value }))
            }
          />
          <div className="auth-popup-actions">
            <button onClick={submitAuth}>
              {authMode === "signin" ? t.authLogin : t.authCreate}
            </button>
            <button onClick={() => setAuthOpen(false)}>{t.authClose}</button>
          </div>
        </div>
      ) : null}

      <div className="hero">
        <div>
          <h3>{t.heroTitle}</h3>
          <p>{t.heroText}</p>
        </div>
        <button onClick={openCart}>{t.cart}: {cart.length}</button>
      </div>

      <div className="ad-grid">
        <div className="ad-card big">
          <h4>{t.ad1Title}</h4>
          <p>{t.ad1Text}</p>
        </div>
        <div className="ad-card">
          <h4>{t.ad2Title}</h4>
          <p>{t.ad2Text}</p>
        </div>
        <div className="ad-card">
          <h4>{t.ad3Title}</h4>
          <p>{t.ad3Text}</p>
        </div>
      </div>

      <div className="trust-row">
        <span>{t.trust1}</span>
        <span>{t.trust2}</span>
        <span>{t.trust3}</span>
      </div>

      <div className="search-wrap">
        <input
          type="text"
          placeholder={t.search}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="premium-categories">
        {categoryStats.map(item => (
          <button
            key={item.id}
            className={category === item.id ? "category-tile active" : "category-tile"}
            onClick={() => setCategory(prev => (prev === item.id ? "" : item.id))}
          >
            <span className="category-icon">{item.icon}</span>
            <span className="category-label">{item.label}</span>
            <span className="category-count">{item.count}+</span>
          </button>
        ))}
      </div>

      <div className="filters">
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">{t.allCategories}</option>
          <option value="clothes">{t.clothes}</option>
          <option value="tech">{t.tech}</option>
          <option value="beauty">{t.beauty}</option>
          <option value="home">{t.home}</option>
          <option value="food">{t.food}</option>
        </select>
        <select value={price} onChange={e => setPrice(e.target.value)}>
          <option value="">{t.anyPrice}</option>
          <option value="low">{t.lowPrice}</option>
          <option value="high">{t.highPrice}</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="popular">{t.popular}</option>
          <option value="price_asc">{t.asc}</option>
          <option value="price_desc">{t.desc}</option>
          <option value="name">{t.byName}</option>
        </select>
      </div>

      <div className="chips">
        {[{ label: "Все", value: "" }, ...categoryConfig].map(chip => {
          const chipValue = chip.value ?? chip.id;
          return (
          <button
            key={chip.id || chip.label}
            className={category === chipValue ? "chip active" : "chip"}
            onClick={() => setCategory(chipValue)}
          >
            {chip.label}
          </button>
          );
        })}
      </div>

      {isLoading ? <p style={{ padding: 10 }}>{t.loading}</p> : null}
      {!isLoading && visibleProducts.length === 0 ? (
        <p style={{ padding: 10 }}>{t.noProducts}</p>
      ) : null}
      {message ? <p style={{ padding: 10 }}>{message}</p> : null}

      <div className="grid">
        {visibleProducts.map(p => (
          <ProductCard key={p._id} p={p} onAddToCart={handleAddToCart} />
        ))}
      </div>

      <div className="checkout-row">
        <button onClick={openCart}>{t.goCart}</button>
      </div>

      <ChatWidget />
      <div id="cart">🛒 {cart.length} | {total} AMD</div>
    </div>
  );
}