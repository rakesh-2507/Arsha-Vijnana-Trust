import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import StorePage from "./pages/StorePage";
import BookDetailsPage from "./pages/BookDetailsPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import CartPage from "./pages/CartPage";
import ContactPage from "./pages/ContactPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
function App() {
  const isLoggedIn = Boolean(localStorage.getItem("user"));

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/store/:id" element={<BookDetailsPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route
            path="/cart"
            element={isLoggedIn ? <CartPage /> : <Navigate to="/" replace />}
          />

          <Route
            path="/orders"
            element={isLoggedIn ? <OrdersPage /> : <Navigate to="/" replace />}
          />

          <Route
            path="/order-success"
            element={isLoggedIn ? <OrderDetailsPage /> : <Navigate to="/" replace />}
          />

          <Route
            path="/profile"
            element={isLoggedIn ? <ProfilePage /> : <Navigate to="/" replace />}
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;