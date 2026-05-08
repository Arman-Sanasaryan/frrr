import { Link } from "react-router-dom";

export default function CancelPage() {
  return (
    <div className="page">
      <div className="panel">
        <h3>Оплата отменена</h3>
        <p>Платеж не завершен, товары остались в корзине.</p>
        <Link to="/cart">Вернуться в корзину</Link>
      </div>
    </div>
  );
}
