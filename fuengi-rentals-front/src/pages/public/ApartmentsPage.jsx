import { useEffect, useState } from "react";

import errorImage from "../../assets/images/error.png";
import { ApartmentCard, StateMsg } from "../../components";
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

  return (
    <>
      <div className="page-head container">
        <h1>Apartamentos en Fuengirola</h1>
        <p>
          Elige la vivienda que encaje con tu viaje, revisa fotos y comprueba
          disponibilidad antes de enviar tu solicitud.
        </p>
      </div>

      <div className="container section-tight">
        {loading ? (
          <StateMsg kind="loading" title="Cargando apartamentos" />
        ) : error ? (
          <StateMsg kind="error" title={error} imageSrc={errorImage} imageAlt="" />
        ) : apartments.length === 0 ? (
          <StateMsg
            kind="empty"
            title="No hay apartamentos publicados"
            desc="Cuando el admin cree apartamentos apareceran aqui."
          />
        ) : (
          <div className="preview-grid">
            {apartments.map((apartment) => (
              <ApartmentCard key={apartment._id} apartment={apartment} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default ApartmentsPage;
