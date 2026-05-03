export default function ProductCard({ p }) {
  return (
    <div className="card">
      <img src={p.image} />
      <h4>{p.name}</h4>
      <p>{p.price} դրամ</p>
      <button>Купить</button>
    </div>
  );
}