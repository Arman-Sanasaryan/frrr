import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { formatPrice } from "../utils/formatPrice";
import "../styles/pages/orders.css";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("ru-RU");
}

export default function MyOrders() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    api
      .get("/my-orders")
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Не удалось загрузить заказы"))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="orders-page">
      <div className="orders-panel">
        <Link to="/" className="orders-back">
          ← В магазин
        </Link>
        <h1>Мои заказы</h1>
        <p className="orders-user">{user.email}</p>

        {loading && <p className="orders-muted">Загрузка…</p>}
        {error && <p className="orders-error">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <p className="orders-muted">Заказов пока нет</p>
        )}

        <ul className="orders-list">
          {orders.map((order) => (
            <li key={order._id} className="orders-card">
              <div className="orders-card-header">
                <span>№ {order._id}</span>
                <span className="orders-status">{order.status}</span>
              </div>
              <p className="orders-meta">
                {formatDate(order.createdAt)} · {order.items?.length || 0} поз.
                {order.paymentMethod === "crypto" && order.cryptoCurrency
                  ? ` · ${order.cryptoCurrency.toUpperCase()}`
                  : ""}
              </p>
              <p className="orders-total">{formatPrice(order.total)}</p>
              <ul className="orders-items">
                {(order.items || []).map((item, index) => (
                  <li key={`${order._id}-${index}`}>
                    <span>{item.name}</span>
                    <span>{formatPrice(item.price)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
