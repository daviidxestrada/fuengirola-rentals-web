import { Link } from "react-router-dom";

import { NOT_FOUND_IMAGE } from "../../utils";

function NotFoundPage() {
  return (
    <section className="notfound">
      <div className="notfound-text">
        <div className="num">404</div>
        <h1>Pagina no encontrada</h1>
        <p>La ruta que buscas no existe o ya no esta disponible.</p>
        <Link to="/" className="btn btn-primary">
          Volver al inicio
        </Link>
      </div>
      <div className="notfound-img" style={{ backgroundImage: `url(${NOT_FOUND_IMAGE})` }} />
    </section>
  );
}

export default NotFoundPage;
