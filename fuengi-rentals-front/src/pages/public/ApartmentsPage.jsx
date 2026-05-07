import { useEffect, useState } from "react";

import { ApartmentCard } from "../../components";
import { getApartments } from "../../services";

function ApartmentsPage() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const data = await getApartments();
        setApartments(data);
      } catch (requestError) {
        console.error(requestError);
        setError("No se pudieron cargar los apartamentos.");
      } finally {
        setLoading(false);
      }
    };

    fetchApartments();
  }, []);

  if (loading) {
    return <p className="page-feedback">Cargando apartamentos...</p>;
  }

  if (error) {
    return <p className="page-feedback page-feedback-error">{error}</p>;
  }

  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="page-eyebrow">Catalogo</p>
        <h1>Apartamentos disponibles</h1>
        <p className="page-lead">
          Una vista clara para comparar opciones antes de entrar al detalle y
          revisar la disponibilidad real.
        </p>
      </div>

      {apartments.length === 0 ? (
        <div className="empty-card">
          <h2>No hay apartamentos publicados</h2>
          <p>Cuando el admin cree apartamentos apareceran aqui.</p>
        </div>
      ) : (
        <div className="apartment-grid">
          {apartments.map((apartment) => (
            <ApartmentCard key={apartment._id} apartment={apartment} />
          ))}
        </div>
      )}
    </section>
  );
}

export default ApartmentsPage;
