import { useEffect, useState } from "react";

import { createBlock, deleteBlock, getApartments, getBlocks } from "../../services";

const initialForm = {
  apartment: "",
  startDate: "",
  endDate: "",
  note: "",
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

function AdminBlocksPage() {
  const [apartments, setApartments] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [apartmentsData, blocksData] = await Promise.all([
        getApartments(),
        getBlocks(),
      ]);

      setApartments(apartmentsData);
      setBlocks(blocksData);
      setForm((currentForm) => ({
        ...currentForm,
        apartment: currentForm.apartment || apartmentsData[0]?._id || "",
      }));
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los bloqueos del panel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.apartment || !form.startDate || !form.endDate) {
      setError("Selecciona apartamento y completa las dos fechas.");
      return;
    }

    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError("La fecha de fin debe ser posterior a la de inicio.");
      return;
    }

    try {
      setSaving(true);
      const newBlock = await createBlock({
        apartment: form.apartment,
        startDate: form.startDate,
        endDate: form.endDate,
        note: form.note.trim(),
      });

      setBlocks((currentBlocks) => [newBlock, ...currentBlocks]);
      setForm((currentForm) => ({
        ...initialForm,
        apartment: currentForm.apartment,
      }));
      setMessage("Bloqueo manual creado correctamente.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudo crear el bloqueo.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (blockId) => {
    const confirmed = window.confirm(
      "Se eliminara el bloqueo manual seleccionado. ¿Quieres continuar?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(blockId);
      setError("");
      setMessage("");
      await deleteBlock(blockId);
      setBlocks((currentBlocks) => currentBlocks.filter((block) => block._id !== blockId));
      setMessage("Bloqueo eliminado correctamente.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudo eliminar el bloqueo.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <p className="admin-eyebrow">Modulo</p>
        <h2>Bloqueo manual de fechas</h2>
        <p>
          Crea cierres manuales por rango para impedir reservas en periodos de
          mantenimiento, uso propio u otros motivos.
        </p>
      </div>

      <div className="admin-apartments-layout">
        <section className="admin-form-card">
          <div className="admin-form-header">
            <h3>Nuevo bloqueo</h3>
            <p>Los bloqueos tambien afectan a la disponibilidad publica.</p>
          </div>

          <form className="admin-form" onSubmit={handleSubmit}>
            <label className="admin-field">
              <span>Apartamento</span>
              <select name="apartment" value={form.apartment} onChange={handleChange}>
                <option value="">Selecciona un apartamento</option>
                {apartments.map((apartment) => (
                  <option key={apartment._id} value={apartment._id}>
                    {apartment.title} - {apartment.city}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span>Fecha inicio</span>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
              />
            </label>

            <label className="admin-field">
              <span>Fecha fin</span>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
              />
            </label>

            <label className="admin-field">
              <span>Nota</span>
              <textarea
                name="note"
                rows="4"
                value={form.note}
                onChange={handleChange}
                placeholder="Mantenimiento, uso propietario, limpieza profunda..."
              />
            </label>

            {(error || message) && (
              <div className={error ? "admin-feedback admin-error" : "admin-feedback admin-success"}>
                {error || message}
              </div>
            )}

            <div className="admin-form-actions">
              <button type="submit" className="admin-primary-button" disabled={saving}>
                {saving ? "Guardando..." : "Crear bloqueo"}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-list-card">
          <div className="admin-form-header">
            <h3>Bloqueos activos</h3>
            <p>
              {loading
                ? "Cargando bloqueos..."
                : `${blocks.length} bloqueos manuales en el panel.`}
            </p>
          </div>

          {loading ? (
            <p>Cargando bloqueos...</p>
          ) : blocks.length === 0 ? (
            <p>No hay bloqueos manuales creados todavia.</p>
          ) : (
            <div className="admin-reservation-list">
              {blocks.map((block) => (
                <article key={block._id} className="admin-reservation-item">
                  <div className="admin-reservation-summary">
                    <div className="admin-reservation-top">
                      <h3>{block.apartment?.title || "Apartamento no disponible"}</h3>
                      <span className="admin-reservation-price">Bloqueo manual</span>
                    </div>

                    <p>
                      <strong>Ciudad:</strong> {block.apartment?.city || "No disponible"}
                    </p>
                    <p>
                      <strong>Inicio:</strong> {formatDate(block.startDate)}
                    </p>
                    <p>
                      <strong>Fin:</strong> {formatDate(block.endDate)}
                    </p>
                    <p>
                      <strong>Nota:</strong> {block.note || "Sin nota"}
                    </p>
                  </div>

                  <div className="admin-apartment-actions">
                    <button
                      type="button"
                      className="admin-danger-button"
                      disabled={deletingId === block._id}
                      onClick={() => handleDelete(block._id)}
                    >
                      {deletingId === block._id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default AdminBlocksPage;
