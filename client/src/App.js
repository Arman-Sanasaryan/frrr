import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import CartPage from "./pages/CartPage";
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage";

function App() {
  return (
    <div className="App">
      <header>
        <h2>🛒 Luvé on Store</h2>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
      </Routes>
    </div>
  );
}

export default App;
