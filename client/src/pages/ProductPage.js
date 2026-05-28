import { useParams } from "react-router-dom";

export default function ProductPage({ products, onAddToCart }) {
  const { id } = useParams();

  const product = products.find(
    (p) => String(p._id) === id
  );

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="product-page">

      {/* LEFT */}
      <div className="product-gallery">
        <img
          src={product.image}
          alt={product.name}
        />
      </div>

      {/* RIGHT */}
      <div className="product-info">

        <div className="product-category">
          {product.category}
        </div>

        <h1>{product.name}</h1>

        <div className="product-price">
          ${product.price}
        </div>

        <p className="product-description">
          Premium quality product with modern design,
          fast delivery and excellent user experience.
        </p>

        <button
          className="buy-btn"
          onClick={() => onAddToCart(product)}
        >
          Add to cart
        </button>

      </div>
    </div>
  );
}