import { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products").then(res => setProducts(res.data));
  }, []);

  return (
    <div>
      <div className="filters">
        <select>
          <option>Все</option>
          <option>Одежда</option>
        </select>
      </div>

      <div className="grid">
        {products.map(p => <ProductCard key={p._id} p={p} />)}
      </div>
    </div>
  );
}