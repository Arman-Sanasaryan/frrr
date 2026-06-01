import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { clearCart, getCartTotal, readCart } from "../utils/cart";
import "../styles/pages/checkout.css";

function formatRub(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

const CRYPTO_OPTIONS = [
  { id: "bitcoin", label: "Bitcoin (BTC)" },
  { id: "ethereum", label: "Ethereum (ETH)" },
  { id: "usdt", label: "USDT (TRC-20)" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const [cart] = useState(() => readCart());
  const [crypto, setCrypto] = useState("bitcoin");
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalRub = useMemo(() => getCartTotal(cart), [cart]);

  useEffect(() => {
    if (cart.length === 0 && !payment) {
      navigate("/", { replace: true });
    }
  }, [cart.length, payment, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    setCopied(false);

    try {
      const res = await api.post("/crypto/checkout", {
        cart,
        currency: crypto,
      });
      setPayment(res.data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Не удалось создать платёж. Проверьте, что API запущен.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function copyAddress() {
    if (!payment?.walletAddress) {
      return;
    }
    try {
      await navigator.clipboard.writeText(payment.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function handlePaid() {
    clearCart();
    navigate("/success");
  }

  if (cart.length === 0 && !payment) {
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-panel">
        <Link to="/" className="checkout-back">
          ← В магазин
        </Link>

        <h1>Оплата криптовалютой</h1>
        <p className="checkout-lead">
          Заказ из {cart.length} позиций на сумму{" "}
          <strong>{formatRub(totalRub)}</strong>
        </p>

        {!payment && (
          <form className="checkout-form" onSubmit={handleSubmit}>
            <label>
              Криптовалюта
              <select
                value={crypto}
                onChange={(e) => setCrypto(e.target.value)}
              >
                {CRYPTO_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {error && <p className="checkout-error">{error}</p>}

            <button type="submit" className="checkout-submit" disabled={loading}>
              {loading ? "Создаём счёт…" : "Получить адрес для оплаты"}
            </button>
          </form>
        )}

        {payment && (
          <div className="checkout-result">
            <p className="checkout-order-id">
              Заказ № <code>{payment.orderId}</code>
            </p>

            <div className="checkout-amount-box">
              <span className="checkout-amount-label">К оплате</span>
              <span className="checkout-amount-crypto">
                {payment.cryptoAmount} {payment.symbol}
              </span>
              <span className="checkout-amount-rub">
                ≈ {formatRub(payment.amountRub)}
              </span>
            </div>

            <label className="checkout-address-label">Адрес кошелька</label>
            <div className="checkout-address-row">
              <code className="checkout-address">{payment.walletAddress}</code>
              <button type="button" onClick={copyAddress}>
                {copied ? "Скопировано" : "Копировать"}
              </button>
            </div>

            <p className="checkout-instructions">{payment.instructions}</p>

            <div className="checkout-actions">
              <button type="button" className="checkout-submit" onClick={handlePaid}>
                Я отправил перевод
              </button>
              <button
                type="button"
                className="checkout-secondary"
                onClick={() => setPayment(null)}
              >
                Выбрать другую монету
              </button>
            </div>
          </div>
        )}

        <ul className="checkout-cart-preview">
          {cart.map((item, index) => (
            <li key={`${item._id}-${index}`}>
              <span>{item.name}</span>
              <span>{formatRub(item.price)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
