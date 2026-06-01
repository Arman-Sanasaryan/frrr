import "./App.css";

import "./styles/global.css";
import "./styles/components/productCard.css";
import "./styles/components/header.css";
import "./styles/components/filters.css";
import "./styles/layout/home.css";

import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage";
import Quantility from "./pages/Quantility";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import AuthCallback from "./pages/AuthCallback";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route path="/quantility" element={<Quantility />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </div>
  );
}

export default App;
