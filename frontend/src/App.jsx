import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { ComparisonProvider } from './context/ComparisonContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import Home from './pages/Home';
import Explore from './pages/Explore';
import SearchResults from './pages/SearchResults';
import ProductDetails from './pages/ProductDetails';
import Compare from './pages/Compare';
import DiscoveryStudio from './pages/DiscoveryStudio';
import BudgetSimulator from './pages/BudgetSimulator';
import MyJourney from './pages/MyJourney';
import Login from './pages/Login';
import Register from './pages/Register';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import OrderDetailsPage from './pages/OrderDetailsPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <ComparisonProvider>
            <Router>
              <ScrollToTop />
              <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#29252A] font-sans selection:bg-[#6D214F] selection:text-white">
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/discovery-studio" element={<DiscoveryStudio />} />
                    <Route path="/budget-simulator" element={<BudgetSimulator />} />
                    <Route path="/decision-arena" element={<Compare />} />
                    <Route path="/my-journey" element={<MyJourney />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/products/:productId" element={<ProductDetails />} />
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/wishlist"
                      element={
                        <ProtectedRoute>
                          <WishlistPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/cart"
                      element={
                        <ProtectedRoute>
                          <CartPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/order-confirmation/:orderId"
                      element={
                        <ProtectedRoute>
                          <OrderConfirmation />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <MyOrders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders/:orderId"
                      element={
                        <ProtectedRoute>
                          <OrderDetailsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </ComparisonProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
