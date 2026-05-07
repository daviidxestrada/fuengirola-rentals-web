import { Link } from "react-router-dom";

function ReservationPage() {
  return (
    <>
      <div className="page-head container">
        <span className="section-kicker">Reserva</span>
        <h1>La solicitud empieza en cada apartamento</h1>
        <p>
          Entra en una ficha, revisa el calendario real y selecciona tus fechas.
          Despues el admin confirma o rechaza la solicitud.
        </p>
      </div>

      <section className="section-tight container">
        <div className="flow-grid">
          {[
            ["01", "Abre el catalogo", "Compara apartamentos y fotos."],
            ["02", "Entra al detalle", "Revisa calendario y caracteristicas."],
            ["03", "Elige fechas", "Marca entrada y salida disponibles."],
            ["04", "Espera respuesta", "La solicitud queda pendiente de aprobacion."],
          ].map(([number, title, text]) => (
            <div className="flow-step" key={number}>
              <div className="flow-step-num">{number}</div>
              <h4>{title}</h4>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <div className="section-actions">
          <Link to="/apartments" className="btn btn-accent btn-lg">
            Ver apartamentos
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Login
          </Link>
        </div>
      </section>
    </>
  );
}

export default ReservationPage;
