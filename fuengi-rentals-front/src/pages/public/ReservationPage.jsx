import { Link } from "react-router-dom";

function ReservationPage() {
  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="page-eyebrow">Reserva</p>
        <h1>La reserva se completa desde la ficha de cada apartamento</h1>
        <p className="page-lead">
          Esta pantalla existe como apoyo de navegacion, pero la disponibilidad real
          y el envio de solicitudes se hacen desde el detalle del apartamento.
        </p>
      </div>

      <section className="empty-card">
        <h2>Pasos para reservar</h2>
        <p>1. Abre el catalogo de apartamentos.</p>
        <p>2. Entra en el detalle del apartamento que te interese.</p>
        <p>3. Revisa las fechas ocupadas y envia la solicitud desde esa ficha.</p>

        <div className="hero-actions">
          <Link to="/apartments" className="site-cta site-cta-primary">
            Ver apartamentos
          </Link>
          <Link to="/login" className="site-cta site-cta-secondary">
            Iniciar sesion
          </Link>
        </div>
      </section>
    </section>
  );
}

export default ReservationPage;
