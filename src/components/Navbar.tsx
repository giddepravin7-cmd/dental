import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

interface UserInfo {
  name: string;
  role: "PATIENT" | "DENTIST" | "ADMIN";
}

const Navbar: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Load user from localStorage whenever route changes
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem("token");
      const stored = localStorage.getItem("user");
      if (token && stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener("authChange", loadUser);
    return () => window.removeEventListener("authChange", loadUser);
  }, [location]);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const isLoggedIn = !!user;
  const isAdmin   = user?.role === "ADMIN";
  const isDentist = user?.role === "DENTIST";
  const isPatient = user?.role === "PATIENT";

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : "navbar--top"}`}>
      <div className="navbar__inner">

        {/* ── Logo ── */}
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon">🦷</div>
          <span className="navbar__logo-text">
            Dentist<span>Finder</span>
          </span>
        </Link>

        {/* ── Desktop Links ── */}
        <div className="navbar__links">

          <Link
            to="/"
            className={`navbar__link ${location.pathname === "/" ? "navbar__link--active" : ""}`}
          >
            Home
          </Link>

            <Link to="/about" className={`navbar__link ${isActive("/about") ? "navbar__link--active" : ""}`}>
            About Us
            </Link>

            <Link to="/faq"     className={`navbar__link ${isActive("/faq")     ? "navbar__link--active" : ""}`}>FAQ</Link>
            <Link to="/contact" className={`navbar__link ${isActive("/contact") ? "navbar__link--active" : ""}`}>Contact</Link>
          {/* PATIENT + DENTIST links */}
          {isPatient && (
            <Link
              to="/dentists"
              className={`navbar__link ${isActive("/dentists") ? "navbar__link--active" : ""}`}
            >
              Find Clinics
            </Link>
          )}

          {isPatient && (
            <Link
              to="/my-appointments"
              className={`navbar__link ${isActive("/my-appointments") ? "navbar__link--active" : ""}`}
            >
              My Appointments
            </Link>
          )}

          {/* DENTIST only */}
          {isDentist && (
            <Link
              to="/dentist/dashboard"
              className={`navbar__link ${isActive("/dentist/dashboard") ? "navbar__link--active" : ""}`}
            >
              My Dashboard
            </Link>
          )}

          {/* ADMIN only */}
          {isAdmin && (
            <>
              <Link
                to="/admin"
                className={`navbar__link ${location.pathname === "/admin" ? "navbar__link--active" : ""}`}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/dentists"
                className={`navbar__link ${isActive("/admin/dentists") ? "navbar__link--active" : ""}`}
              >
                Dentists
              </Link>
              <Link
                to="/admin/users"
                className={`navbar__link ${isActive("/admin/users") ? "navbar__link--active" : ""}`}
              >
                Users
              </Link>
            </>
          )}
        </div>

        {/* ── Right: Auth area ── */}
        <div className="navbar__auth">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="navbar__btn navbar__btn--ghost">
                Login
              </Link>
              <Link to="/register" className="navbar__btn navbar__btn--primary">
                Register
              </Link>
            </>
          ) : (
            <div className="navbar__user">
              <span className="navbar__user-name">
                {user?.name?.split(" ")[0]}
              </span>
              <span className={`navbar__badge navbar__badge--${user?.role?.toLowerCase()}`}>
                {user?.role}
              </span>
              <button
                className="navbar__btn navbar__btn--logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}

          {/* Hamburger */}
          <button
            className={`navbar__hamburger ${mobileOpen ? "navbar__hamburger--open" : ""}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div
        ref={mobileMenuRef}
        className={`navbar__mobile ${mobileOpen ? "navbar__mobile--open" : ""}`}
      >
        <Link
          to="/"
          className={`navbar__mobile-link ${location.pathname === "/" ? "navbar__mobile-link--active" : ""}`}
        >
          Home
        </Link>

        {/* PATIENT + DENTIST */}
        {isPatient && (
          <Link
            to="/dentists"
            className={`navbar__mobile-link ${isActive("/dentists") ? "navbar__mobile-link--active" : ""}`}
          >
            Dentists
          </Link>
        )}

        {isPatient && (
          <Link
            to="/my-appointments"
            className={`navbar__mobile-link ${isActive("/my-appointments") ? "navbar__mobile-link--active" : ""}`}
          >
            My Appointments
          </Link>
        )}

        {isDentist && (
          <Link
            to="/dentist/dashboard"
            className={`navbar__mobile-link ${isActive("/dentist/dashboard") ? "navbar__mobile-link--active" : ""}`}
          >
            My Dashboard
          </Link>
        )}

        {/* ADMIN */}
        {isAdmin && (
          <>
            <Link
              to="/admin"
              className={`navbar__mobile-link ${location.pathname === "/admin" ? "navbar__mobile-link--active" : ""}`}
            >
              Admin Dashboard
            </Link>
            <Link
              to="/admin/dentists"
              className={`navbar__mobile-link ${isActive("/admin/dentists") ? "navbar__mobile-link--active" : ""}`}
            >
              Manage Dentists
            </Link>
            <Link
              to="/admin/users"
              className={`navbar__mobile-link ${isActive("/admin/users") ? "navbar__mobile-link--active" : ""}`}
            >
              Manage Users
            </Link>
          </>
        )}

        {!isLoggedIn ? (
          <>
            <Link to="/login" className="navbar__mobile-link">Login</Link>
            <Link to="/register" className="navbar__mobile-link navbar__mobile-link--highlight">
              Register
            </Link>
          </>
        ) : (
          <>
            <div className="navbar__mobile-user">
              <span>{user?.name}</span>
              <span className={`navbar__badge navbar__badge--${user?.role?.toLowerCase()}`}>
                {user?.role}
              </span>
            </div>
            <button className="navbar__mobile-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;