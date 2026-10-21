
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

import LoginModal from "../../components/auth/LoginModal";
import RegisterModal from "../../components/auth/RegisterModal";
import { logoutUser } from "../../api/auth";
import { getCart } from "../../api/cart";

type AuthModal = "login" | "register" | null;

function getAccessToken(): string | null {
  return (
    localStorage.getItem("access_token") ??
    localStorage.getItem("token")
  );
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<AuthModal>(null);

  const [loggedIn, setLoggedIn] = useState(
    () => Boolean(getAccessToken()),
  );

  const [cartCount, setCartCount] = useState(0);
  const [cartGlowing, setCartGlowing] = useState(false);

  const cartGlowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartGlowFrame = useRef<number | null>(null);

  const refreshCartCount = useCallback(async () => {
    if (!getAccessToken()) {
      setCartCount(0);
      return;
    }

    try {
      const cart = await getCart();

      const count = cart.items.reduce((total, item) => {
        const quantity = Number(item.quantity ?? 0);

        return (
          total +
          (Number.isFinite(quantity) && quantity > 0 ? quantity : 0)
        );
      }, 0);

      setCartCount(count);
    } catch (error) {
      console.error("Unable to fetch cart count:", error);
    }
  }, []);

  const triggerCartGlow = useCallback(() => {
    if (location.pathname === "/cart") return;

    if (cartGlowTimer.current !== null) {
      clearTimeout(cartGlowTimer.current);
      cartGlowTimer.current = null;
    }

    if (cartGlowFrame.current !== null) {
      cancelAnimationFrame(cartGlowFrame.current);
      cartGlowFrame.current = null;
    }

    setCartGlowing(true);
  }, [location.pathname]);

  useEffect(() => {
    const refreshAuth = () => {
      const authenticated = Boolean(getAccessToken());

      setLoggedIn(authenticated);

      if (authenticated) {
        void refreshCartCount();
      } else {
        setCartCount(0);
      }
    };

    const handleCartUpdated = () => {
      void refreshCartCount();
      triggerCartGlow();
    };

    void Promise.resolve().then(() => refreshCartCount());

    window.addEventListener("authChanged", refreshAuth);
    window.addEventListener("cartUpdated", handleCartUpdated);
    window.addEventListener("storage", refreshAuth);

    return () => {
      window.removeEventListener("authChanged", refreshAuth);
      window.removeEventListener("cartUpdated", handleCartUpdated);
      window.removeEventListener("storage", refreshAuth);

      if (cartGlowTimer.current !== null) {
        clearTimeout(cartGlowTimer.current);
      }

      if (cartGlowFrame.current !== null) {
        cancelAnimationFrame(cartGlowFrame.current);
      }
    };
  }, [refreshCartCount, triggerCartGlow]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-base tracking-widest font-medium transition ${isActive
      ? "bg-orange-50 text-orange-700 text-lg"
      : "text-gray-900 hover:bg-orange-50 hover:text-orange-600"
    }`;

  const openModal = (modal: AuthModal) => {
    setMenuOpen(false);
    setActiveModal(modal);
  };

  const handleLoginSuccess = () => {
    setLoggedIn(Boolean(getAccessToken()));
    setActiveModal(null);

    window.dispatchEvent(new Event("authChanged"));
    void refreshCartCount();
  };

  const handleLogout = () => {
    logoutUser();

    setLoggedIn(false);
    setCartCount(0);
    setCartGlowing(false);
    setMenuOpen(false);
    setActiveModal(null);

    window.dispatchEvent(new Event("authChanged"));
    navigate("/");
  };

const handleCartClick = () => {
  setMenuOpen(false);

  if (getAccessToken()) {
    setCartGlowing(false);
    navigate("/cart");
  } else {
    setActiveModal("login");
  }
};

  const renderCartButton = (mobile = false) => (
    <button
      type="button"
      onClick={handleCartClick}
      aria-label={`Shopping cart, ${cartCount} items`}
      className={`relative flex shrink-0 items-center justify-center rounded-full border border-orange-200 text-orange-600 transition-all duration-300 hover:bg-orange-50 ${mobile ? "h-10 w-10" : "h-11 w-11"
        } ${cartGlowing
          ? "animate-cart-glow border-orange-500 bg-orange-50"
          : ""
        }`}
    >
      <ShoppingCart className="h-5 w-5" />

      {cartCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-xs font-bold text-white">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </button>
  );

  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-orange-100 bg-white/95 shadow-sm backdrop-blur-md">
        <nav className="mx-auto flex min-h-20 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="shrink-0"
            aria-label="Arsha Vijnana Trust home"
          >
            <img
              src="/hero.png"
              alt="Arsha Vijnana Trust"
              className="h-12 w-auto object-contain sm:h-14"
            />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <NavLink to="/" end className={navLinkClass}>
              HOME
            </NavLink>

            <NavLink to="/about" className={navLinkClass}>
              ABOUT US
            </NavLink>

            <NavLink to="/store" className={navLinkClass}>
              STORE
            </NavLink>

            {loggedIn && (
              <NavLink to="/orders" className={navLinkClass}>
                ORDERS
              </NavLink>
            )}

            <NavLink to="/contact" className={navLinkClass}>
              CONTACT
            </NavLink>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {renderCartButton()}

            {loggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="rounded-full border border-orange-200 px-5 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
                >
                  My Account
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openModal("login")}
                  className="rounded-full border border-orange-200 px-5 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => openModal("register")}
                  className="rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
                >
                  Register
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {renderCartButton(true)}

            <button
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-orange-100 text-gray-700 transition hover:bg-orange-50 hover:text-orange-600"
            >
              {menuOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-6 w-6"
                >
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-6 w-6"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="border-t border-orange-100 bg-white px-4 pb-5 pt-3 shadow-lg lg:hidden">
            <div className="mx-auto flex flex-col gap-1">
              <NavLink
                to="/"
                end
                className={navLinkClass}
                onClick={closeMobileMenu}
              >
                Home
              </NavLink>

              <NavLink
                to="/about"
                className={navLinkClass}
                onClick={closeMobileMenu}
              >
                About Us
              </NavLink>

              <NavLink
                to="/store"
                className={navLinkClass}
                onClick={closeMobileMenu}
              >
                Store
              </NavLink>

              {loggedIn && (
                <NavLink
                  to="/orders"
                  className={navLinkClass}
                  onClick={closeMobileMenu}
                >
                  Orders
                </NavLink>
              )}

              <NavLink
                to="/contact"
                className={navLinkClass}
                onClick={closeMobileMenu}
              >
                Contact
              </NavLink>

              <div className="mt-3 flex gap-3 border-t border-orange-100 pt-4">
                {loggedIn ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="flex-1 rounded-full border border-orange-200 px-4 py-2.5 text-center text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
                    >
                      My Account
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex-1 rounded-full bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openModal("login")}
                      className="flex-1 rounded-full border border-orange-200 px-4 py-2.5 text-center text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
                    >
                      Login
                    </button>

                    <button
                      type="button"
                      onClick={() => openModal("register")}
                      className="flex-1 rounded-full bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {activeModal === "login" && (
        <LoginModal
          onClose={() => setActiveModal(null)}
          onSwitchToRegister={() => setActiveModal("register")}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {activeModal === "register" && (
        <RegisterModal
          onClose={() => setActiveModal(null)}
          onSwitchToLogin={() => setActiveModal("login")}
        />
      )}
    </>
  );
}

export default Navbar;
