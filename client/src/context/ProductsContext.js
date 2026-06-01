import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import demoProducts from "../data/Products";

const ProductsContext = createContext({
  products: demoProducts,
  loading: true,
  source: "demo",
});

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(demoProducts);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("demo");

  useEffect(() => {
    let cancelled = false;

    api
      .get("/products")
      .then((res) => {
        if (cancelled) return;
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProducts(res.data);
          setSource("api");
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading, source }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
