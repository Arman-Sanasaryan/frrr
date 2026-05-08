import { useEffect } from "react";
import { Link } from "react-router-dom";
import { clearCart } from "../utils/cart";

export default function SuccessPage() {
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="page">
      <div className="panel">
        <h3>Оплата прошла успешно</h3>
        <p>Спасибо за заказ! Корзина очищена.</p>
        <Link to="/">Вернуться в магазин</Link>
      </div>
    </div>
  );
}
