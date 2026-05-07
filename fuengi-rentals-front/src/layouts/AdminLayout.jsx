import { useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { Logo } from "../components";
import { AuthContext } from "../context";

const adminLinks = [
  {
    to: "/admin",
    label: "Resumen",
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
  },
  {
    to: "/admin/apartments",
    label: "Apartamentos",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 21V8l9-5 9 5v13" />
        <path d="M9 21v-7h6v7" />
      </svg>
    ),
  },
  {
    to: "/admin/reservations",
    label: "Reservas",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    to: "/admin/blocks",
    label: "Bloqueos",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="10" />
        <path d="M4.93 4.93l14.14 14.14" />
      </svg>
    ),
  },
];

function getInitials(user) {
  return (user?.name || user?.email || "FR")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-brand">
          <Logo inverted />
          <span className="label">Administracion</span>
        </div>

        <nav className="admin-nav">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-side-foot">
          <button type="button" className="back-site" onClick={() => navigate("/")}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M9 18l-6-6 6-6" />
              <path d="M3 12h18" />
            </svg>
            Volver a la web
          </button>
          <div className="who">
            <div className="who-avatar">{getInitials(user)}</div>
            <div className="who-info">
              <div className="nm">{user?.name || "Admin"}</div>
              <div className="em">{user?.email}</div>
            </div>
          </div>
          <button type="button" className="signout" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
