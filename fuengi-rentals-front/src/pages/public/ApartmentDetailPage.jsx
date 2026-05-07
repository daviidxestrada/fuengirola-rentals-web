import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { ReservationForm } from "../../components";
import { getApartmentById } from "../../services";

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
    return <p className="page-feedback">Cargando apartamento...</p>;
  }

  if (error) {
    return <p className="page-feedback page-feedback-error">{error}</p>;
  }

  if (!apartment) {
    return <p className="page-feedback page-feedback-error">Apartamento no encontrado.</p>;
  }

  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="page-eyebrow">{apartment.city}</p>
        <h1>{apartment.title}</h1>
        <p className="page-lead">
          {apartment.price} EUR por noche · Consulta el detalle y revisa la
          disponibilidad antes de reservar.
        </p>
      </div>

      <section className="detail-layout">
        <article className="detail-card">
          <div className="detail-gallery">
            {apartment.images && apartment.images.length > 0 ? (
              apartment.images.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${apartment.title} ${index + 1}`}
                  className="detail-gallery-image"
                />
              ))
            ) : (
              <div className="detail-gallery-empty">
                <span>Sin imagenes publicadas</span>
              </div>
            )}
          </div>

          <div className="detail-summary">
            <div className="detail-meta">
              <span className="price-pill">{apartment.price} EUR / noche</span>
              <span className="neutral-pill">{apartment.city}</span>
            </div>
            <p>{apartment.description}</p>
          </div>
        </article>

        <ReservationForm apartmentId={apartment._id} />
      </section>
    </section>
  );
}

export default ApartmentDetailPage;
