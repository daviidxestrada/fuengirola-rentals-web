import { useContext, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { Logo } from "../components";
import { AuthContext } from "../context";

function MainLayout() {
  const { user, authReady } = useContext(AuthContext);
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  const isHome = location.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerClassName = [
    "site-header",
    isHome ? "transparent" : "",
    scrolled ? "scrolled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="site-shell">
      <header className={headerClassName}>
        <div className="container header-inner">
          <Link to="/" className="logo-btn" onClick={closeMenu} aria-label="Inicio">
            <Logo inverted={isHome && !scrolled} />
          </Link>

          <nav className="header-nav">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Inicio
            </NavLink>
            <NavLink
              to="/apartments"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Apartamentos
            </NavLink>
            {isAdmin ? (
              <NavLink
                to="/admin"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Admin
              </NavLink>
            ) : null}
          </nav>

          <div className="header-right">
            {!authReady ? (
              <span className="header-status">Comprobando sesion</span>
            ) : user ? (
              <Link to={isAdmin ? "/admin" : "/account"} className="btn btn-ghost btn-sm">
                {isAdmin ? "Panel admin" : "Mi cuenta"}
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-secondary btn-sm">
                  Crear cuenta
                </Link>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Login
                </Link>
              </>
            )}

            <button
              type="button"
              className="btn-icon header-burger"
              aria-expanded={menuOpen}
              aria-label="Menu"
              onClick={() => setMenuOpen((currentValue) => !currentValue)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="mobile-menu">
            <Link to="/" onClick={closeMenu}>
              Inicio
            </Link>
            <Link to="/apartments" onClick={closeMenu}>
              Apartamentos
            </Link>
            {user ? (
              <Link to={isAdmin ? "/admin" : "/account"} onClick={closeMenu}>
                {isAdmin ? "Panel admin" : "Mi cuenta"}
              </Link>
            ) : (
              <>
                <Link to="/register" onClick={closeMenu}>
                  Crear cuenta
                </Link>
                <Link to="/login" onClick={closeMenu}>
                  Login
                </Link>
              </>
            )}
          </div>
        ) : null}
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <Logo inverted />
            <p className="footer-tag">
              Apartamentos turisticos en Fuengirola con reserva directa y gestion familiar.
            </p>
          </div>
          <div className="footer-cols">
            <div>
              <h5>Reservas</h5>
              <Link to="/apartments">Apartamentos</Link>
              <Link to="/account">Mis reservas</Link>
            </div>
            <div>
              <h5>Contacto</h5>
              <a href="mailto:hola@fuengirolarentals.es">hola@fuengirolarentals.es</a>
              <a href="tel:+34952000000">+34 952 00 00 00</a>
            </div>
            <div>
              <h5>Zona</h5>
              <span>Fuengirola</span>
              <span>Costa del Sol</span>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>2026 Fuengirola Rentals</span>
          <span>Reserva directa para estancias en la Costa del Sol</span>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
