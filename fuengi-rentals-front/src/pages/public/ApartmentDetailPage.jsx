import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Gallery, ReservationForm, StateMsg } from "../../components";
import { getApartmentById } from "../../services";
import { getApartmentFeatures, getApartmentImages } from "../../utils";

function ApartmentDetailPage() {
  const { id } = useParams();

  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const data = await getApartmentById(id);
        setApartment(data);
      } catch (requestError) {
        console.error(requestError);
        setError("No se pudo cargar el apartamento.");
      } finally {
        setLoading(false);
      }
    };

    fetchApartment();
  }, [id]);

  if (loading) {
    return (
      <div className="container section-tight">
        <StateMsg kind="loading" title="Cargando apartamento" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container section-tight">
        <StateMsg kind="error" title={error} />
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="container section-tight">
        <StateMsg kind="error" title="Apartamento no encontrado" />
      </div>
    );
  }

  const images = getApartmentImages(apartment);
  const features = getApartmentFeatures(apartment);

  return (
    <>
      <div className="container">
        <Link to="/apartments" className="detail-back">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Todos los apartamentos
        </Link>
      </div>

      <div className="container">
        <Gallery images={images} title={apartment.title} />
      </div>

      <div className="container detail-grid">
        <div className="detail-main">
          <h1>{apartment.title}</h1>
          <div className="detail-loc">{apartment.city || "Fuengirola"} - Costa del Sol</div>

          <p className="detail-desc">{apartment.description}</p>

          <div className="detail-section">
            <h3>Destacados del apartamento</h3>
            <div className="feature-grid">
              {features.map((feature) => (
                <div className="feature-item" key={feature}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="detail-section detail-note">
            <h3>Como funciona la reserva</h3>
            <p>
              El calendario muestra fechas ocupadas importadas desde Booking.com, bloqueos manuales
              y solicitudes hechas desde esta web. Tu solicitud queda pendiente hasta que el admin la
              apruebe.
            </p>
          </div>
        </div>

        <ReservationForm apartment={apartment} />
      </div>
    </>
  );
}

export default ApartmentDetailPage;
