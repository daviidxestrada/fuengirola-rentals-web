import { Link } from "react-router-dom";

function HomePage() {
  return (
    <section className="page-stack">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="page-eyebrow">Reserva directa sin intermediarios</p>
          <h1>Encuentra un apartamento claro, disponible y listo para reservar</h1>
          <p className="page-lead">
            Un MVP centrado en lo importante: ver apartamentos, consultar fechas
            ocupadas y enviar reservas desde una experiencia simple y limpia.
          </p>

          <div className="hero-actions">
            <Link to="/apartments" className="site-cta site-cta-primary">
              Ver apartamentos
            </Link>
            <Link to="/login" className="site-cta site-cta-secondary">
              Ver mis reservas
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-stat">
            <span>Catalogo</span>
            <strong>Apartamentos con fotos, precios y caracteristicas</strong>
          </div>
          <div className="hero-stat">
            <span>Disponibilidad</span>
            <strong>Haz tu reserva y gestionala desde aqui.</strong>
          </div>
          <div className="hero-stat">
            <span>Gestion</span>
            <strong>Panel admin privado para operar el sistema</strong>
          </div>
        </div>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <p className="page-eyebrow">1</p>
          <h2>Explora el catalogo</h2>
          <p>Consulta titulo, ciudad, precio y detalle de cada apartamento.</p>
        </article>

        <article className="info-card">
          <p className="page-eyebrow">2</p>
          <h2>Revisa disponibilidad</h2>
          <p>Las fechas ocupadas se muestran antes de intentar reservar.</p>
        </article>

        <article className="info-card">
          <p className="page-eyebrow">3</p>
          <h2>Gestiona desde admin</h2>
          <p>El panel privado permite operar apartamentos, reservas y bloqueos.</p>
        </article>
      </section>
    </section>
  );
}

export default HomePage;
