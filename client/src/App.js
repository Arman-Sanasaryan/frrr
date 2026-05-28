import "./App.css";

import "./styles/global.css";
import "./styles/components/productCard.css";
import "./styles/components/header.css";
import "./styles/components/filters.css";
import "./styles/layout/home.css";

import demoProducts from "./data/Products";

import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage";
import Quantility from "./pages/Quantility";

function App() {

  function handleAddToCart(product) {
    console.log("added:", product);
  }
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/product/:id"
          element={
            <ProductPage
              products={demoProducts}
              onAddToCart={handleAddToCart}
            />
          }
        />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route path="/quantility" element={<Quantility />} />
      </Routes>
    </div>
  );
}

export default App;
