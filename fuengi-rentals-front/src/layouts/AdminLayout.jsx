import { useContext } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { AuthContext } from "../context";

const adminLinks = [
  { to: "/admin", label: "Resumen", end: true },
  { to: "/admin/apartments", label: "Apartamentos" },
  { to: "/admin/reservations", label: "Reservas" },
  { to: "/admin/blocks", label: "Bloqueos" },
];

function AdminLayout() {
  const { user, logout } = useContext(AuthContext);

  return (
    <section className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <p className="admin-eyebrow">Panel privado</p>
          <h1>Direct Booking</h1>
          <p>Sesion iniciada como {user?.email}</p>
        </div>

        <nav className="admin-nav">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? "admin-link admin-link-active" : "admin-link"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="admin-logout" onClick={logout}>
          Cerrar sesion
        </button>
      </aside>

      <div className="admin-content">
        <Outlet />
      </div>
    </section>
  );
}

export default AdminLayout;
