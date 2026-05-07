import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ApartmentCard } from "../../components";
import { getApartments } from "../../services";
import { BENEFITS_IMAGE, HERO_IMAGE } from "../../utils";

function HomePage() {
  const [apartments, setApartments] = useState([]);

  useEffect(() => {
    const loadFeaturedApartments = async () => {
      try {
        const data = await getApartments();
        setApartments(data.slice(0, 3));
      } catch (error) {
        console.error(error);
      }
    };

    loadFeaturedApartments();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-img" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="hero-inner container">
          <div>
            <span className="hero-kicker">Fuengirola - Costa del Sol</span>
            <h1 className="hero-title">Apartamentos junto al Mediterraneo, reserva directa.</h1>
            <p className="hero-sub">
              Consulta disponibilidad real, envia tu solicitud y recibe confirmacion desde una
              gestion cercana, clara y sin ruido.
            </p>
            <div className="hero-ctas">
              <Link to="/apartments" className="btn btn-accent btn-lg">
                Ver apartamentos
              </Link>
              <Link to="/account" className="btn btn-secondary btn-lg">
                Mis reservas
              </Link>
            </div>
          </div>

          <div className="hero-meta">
            <div className="hero-meta-item">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 21V8l9-5 9 5v13" />
                <path d="M9 21v-7h6v7" />
              </svg>
              3 apartamentos turisticos
            </div>
            <div className="hero-meta-item">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Fuengirola, Malaga
            </div>
            <div className="hero-meta-item">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
              </svg>
              Calendario sincronizado con Booking
            </div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Reserva facil, con control manual antes de confirmar.</h2>
        </div>
        <div className="flow-grid">
          {[
            ["01", "Elige apartamento", "Compara fotos, descripcion, precio y zona."],
            ["02", "Revisa calendario", "Veras reservas de Booking, bloqueos y solicitudes web."],
            ["03", "Envia solicitud", "Selecciona entrada y salida para pedir esos dias."],
            ["04", "Confirmacion privada", "El admin revisa y aprueba desde el panel."],
          ].map(([number, title, text]) => (
            <div className="flow-step" key={number}>
              <div className="flow-step-num">{number}</div>
              <h4>{title}</h4>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {apartments.length > 0 ? (
        <section className="section container section-featured">
          <div className="section-head">
            <span className="section-kicker">Catalogo</span>
            <h2>Apartamentos destacados</h2>
          </div>
          <div className="preview-grid">
            {apartments.map((apartment) => (
              <ApartmentCard key={apartment._id} apartment={apartment} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section container">
        <div className="benefits">
          <div className="benefits-img" style={{ backgroundImage: `url(${BENEFITS_IMAGE})` }} />
          <div>
            <span className="section-kicker">Gestion</span>
            <h2>Una web pensada para vender directo sin perder el control.</h2>
            <div className="benefits-list">
              {[
                ["01", "Fotos protagonistas", "Cada apartamento puede tener una galeria visual completa."],
                ["02", "Disponibilidad fiable", "El iCal de Booking se importa para evitar solicitudes imposibles."],
                ["03", "Solicitudes pendientes", "Las reservas web no se aprueban solas: el admin decide."],
                ["04", "Bloqueos manuales", "Puedes cerrar fechas por mantenimiento, uso propio o limpieza."],
              ].map(([number, title, text]) => (
                <div className="benefit-item" key={number}>
                  <div className="benefit-num">{number}</div>
                  <div>
                    <h4>{title}</h4>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
