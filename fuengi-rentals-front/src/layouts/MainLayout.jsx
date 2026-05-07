import { useContext, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

import menuIcon from "../assets/images/iconmenu.svg";
import { AuthContext } from "../context";

function MainLayout() {
  const { user, authReady } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";
  const [menuOpen, setMenuOpen] = useState(false);

  // Cierra el panel movil al navegar por la app.
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="site-brand" onClick={closeMenu}>
            <strong>
              <span>Direct </span>
              <br className="site-brand-break" />
              <span>Booking</span>
            </strong>
          </Link>

          <button
            type="button"
            className="site-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="site-menu-panel"
            // El mismo boton abre y cierra el menu responsive.
            onClick={() => setMenuOpen((currentValue) => !currentValue)}
          >
            <img src={menuIcon} alt="" aria-hidden="true" className="site-menu-toggle-icon" />
            <span>{menuOpen ? "Cerrar" : "Menu"}</span>
          </button>

          <div
            id="site-menu-panel"
            className={`site-menu-panel${menuOpen ? " site-menu-panel-open" : ""}`}
          >
            <nav className="site-nav">
              <NavLink
                to="/"
                end
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? "site-nav-link site-nav-link-active" : "site-nav-link"
                }
              >
                Inicio
              </NavLink>
              <NavLink
                to="/apartments"
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? "site-nav-link site-nav-link-active" : "site-nav-link"
                }
              >
                Apartamentos
              </NavLink>
            </nav>

            <div className="site-actions">
              {!authReady ? (
                <span className="site-status-pill">Comprobando sesion</span>
              ) : user ? (
                <Link
                  to={isAdmin ? "/admin" : "/account"}
                  className="site-cta site-cta-primary"
                  onClick={closeMenu}
                >
                  {isAdmin ? "Ir al panel admin" : "Mi panel"}
                </Link>
              ) : (
                <>
                  <Link to="/register" className="site-cta site-cta-secondary" onClick={closeMenu}>
                    Crear cuenta
                  </Link>
                  <Link to="/login" className="site-cta site-cta-primary" onClick={closeMenu}>
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p>Direct Booking · Reservas directas para apartamentos turisticos</p>
          <p>Proyecto Full Stack con React, Express y MongoDB</p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
