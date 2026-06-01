import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useProducts } from "../context/ProductsContext";
import { readCart, writeCart } from "../utils/cart";
import { formatPrice } from "../utils/formatPrice";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fromList = products.find((p) => String(p._id) === id);
    if (fromList) {
      setProduct(fromList);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api
      .get(`/products/${id}`)
      .then((res) => {
        if (!cancelled) setProduct(res.data);
      })
      .catch(() => {
        if (!cancelled) setProduct(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, products]);

  function handleAddToCart() {
    if (!product) return;
    const next = [...readCart(), product];
    writeCart(next);
    navigate("/");
  }

  if (loading) {
    return <div className="product-page">Загрузка…</div>;
  }

  if (!product) {
    return (
      <div className="product-page">
        <p>Товар не найден</p>
        <Link to="/">← На главную</Link>
      </div>
    );
  }

  return (
    <div className="product-page">
      <Link to="/" className="orders-back">
        ← На главную
      </Link>

      <div className="product-gallery">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-info">
        <div className="product-category">
          {product.category}
          {product.subcategory ? ` · ${product.subcategory}` : ""}
        </div>

        <h1>{product.name}</h1>

        <div className="product-price">{formatPrice(product.price)}</div>

        <p className="product-description">
          Качественный товар с быстрой доставкой. Данные загружены из базы
          магазина.
        </p>

        <button type="button" className="buy-btn" onClick={handleAddToCart}>
          В корзину
        </button>
      </div>
    </div>
  );
}
