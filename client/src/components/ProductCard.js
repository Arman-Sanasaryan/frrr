import { Link } from "react-router-dom";

export default function ProductCard({ p, onAddToCart }) {
  return (
  <Link
    to={`/product/${p._id}`}
    className="product-link"
  >
    <div className="product-card">

      <div className="img-wrap">
        <img src={p.image} alt={p.name} />
      </div>

      <div className="title">
        {p.name}
      </div>

      <div className="bottom">

        <div className="price">
          ${p.price}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            onAddToCart(p);
          }}
        >
          Add
        </button>

      </div>
    </div>
  </Link>
);
}