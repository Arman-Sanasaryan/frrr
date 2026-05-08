export default function ProductCard({ p, onAddToCart }) {
  const oldPrice = Math.round(Number(p.price) * 1.25);
  const discount = Math.max(5, Math.round(((oldPrice - p.price) / oldPrice) * 100));

  return (
    <div className="card">
      <img src={p.image} alt={p.name} loading="lazy" />
      {p.badge ? <span className="badge">{p.badge}</span> : null}
      <h4>{p.name}</h4>
      {p.subtitle ? <p className="subtitle">{p.subtitle}</p> : null}
      <div className="price-row">
        <strong>{p.price} AMD</strong>
        <span className="old-price">{oldPrice} AMD</span>
        <span className="discount">-{discount}%</span>
      </div>
      <p className="meta">4.7 ★ | 1.2k+ заказов</p>
      <button onClick={() => onAddToCart(p)}>Купить</button>
    </div>
  );
}