import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getCartTotal, readCart, writeCart } from "../utils/cart";

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCartItems(readCart());
  }, []);

  const total = useMemo(() => getCartTotal(cartItems), [cartItems]);

  function removeItem(index) {
    const next = cartItems.filter((_, i) => i !== index);
    setCartItems(next);
    writeCart(next);
  }

  async function checkout() {
    if (cartItems.length === 0) {
      setMessage("Корзина пуста.");
      return;
    }

    try {
      const res = await api.post("/create-checkout-session", { cart: cartItems });
      window.location.href = res.data.url;
    } catch {
      setMessage("Не удалось перейти к оплате.");
    }
  }

  return (
    <div className="page">
      <div className="panel">
        <h3>Корзина</h3>
        {cartItems.length === 0 ? <p>В корзине пока нет товаров.</p> : null}
        {cartItems.map((item, index) => (
          <div className="cart-item" key={`${item._id || item.name}-${index}`}>
            <span>{item.name}</span>
            <span>{item.price} AMD</span>
            <button onClick={() => removeItem(index)}>Удалить</button>
          </div>
        ))}
        <p className="status">Итого: {total} AMD</p>
        {message ? <p className="status">{message}</p> : null}
        <div className="row-actions">
          <button onClick={checkout}>Оплатить</button>
          <button onClick={() => navigate("/")}>Назад в магазин</button>
        </div>
        <p className="status">
          После оплаты Stripe вернет на страницу <code>/success</code> или{" "}
          <code>/cancel</code>.
        </p>
      </div>
      <Link to="/" className="link-home">
        На главную
      </Link>
    </div>
  );
}
