import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="empty-card">
      <p className="page-eyebrow">404</p>
      <h1>Pagina no encontrada</h1>
      <p>La ruta que buscas no existe o ya no esta disponible.</p>
      <Link to="/" className="site-cta site-cta-primary">
        Volver al inicio
      </Link>
    </section>
  );
}

export default NotFoundPage;
