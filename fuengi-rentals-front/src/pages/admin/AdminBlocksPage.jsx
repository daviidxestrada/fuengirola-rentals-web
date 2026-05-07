import { useEffect, useState } from "react";

import { Field, StateMsg } from "../../components";
import { createBlock, deleteBlock, getApartments, getBlocks } from "../../services";
import { formatDateShort, getApartmentImages } from "../../utils";

const initialForm = {
  apartment: "",
  startDate: "",
  endDate: "",
  note: "",
};

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
      const [apartmentsData, blocksData] = await Promise.all([getApartments(), getBlocks()]);

      setApartments(apartmentsData);
      setBlocks(blocksData);
      setForm((currentForm) => ({
        ...currentForm,
        apartment: currentForm.apartment || apartmentsData[0]?._id || "",
      }));
    } catch (requestError) {
      console.error(requestError);
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
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || "No se pudo crear el bloqueo.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (blockId) => {
    const confirmed = window.confirm("Se eliminara el bloqueo manual seleccionado. Quieres continuar?");

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
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || "No se pudo eliminar el bloqueo.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Bloqueo manual de fechas</h1>
          <p>Cierra rangos por mantenimiento, uso propietario, limpieza o cualquier motivo interno.</p>
        </div>
      </div>

      {(error || message) ? (
        <div className={error ? "admin-feedback admin-error" : "admin-feedback admin-success"}>
          {error || message}
        </div>
      ) : null}

      <div className="admin-apartments-layout">
        <section className="admin-section admin-form-card">
          <div className="admin-section-head">
            <div>
              <h2>Nuevo bloqueo</h2>
              <p>Estos bloqueos tambien afectan al calendario publico.</p>
            </div>
          </div>

          <form className="admin-form" onSubmit={handleSubmit}>
            <Field label="Apartamento" name="apartment" as="select" value={form.apartment} onChange={handleChange}>
              <option value="">Selecciona un apartamento</option>
              {apartments.map((apartment) => (
                <option key={apartment._id} value={apartment._id}>
                  {apartment.title} - {apartment.city}
                </option>
              ))}
            </Field>
            <div className="field-row">
              <Field label="Fecha inicio" type="date" name="startDate" value={form.startDate} onChange={handleChange} />
              <Field label="Fecha fin" type="date" name="endDate" value={form.endDate} onChange={handleChange} />
            </div>
            <Field
              label="Nota"
              name="note"
              as="textarea"
              rows={4}
              value={form.note}
              onChange={handleChange}
              placeholder="Mantenimiento, uso propietario, limpieza profunda..."
            />
            <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
              {saving ? "Guardando..." : "Crear bloqueo"}
            </button>
          </form>
        </section>

        <section className="admin-section admin-list-card">
          <div className="admin-section-head">
            <div>
              <h2>Bloqueos activos</h2>
              <p>{loading ? "Cargando bloqueos..." : `${blocks.length} bloqueos manuales en el panel.`}</p>
            </div>
          </div>

          {loading ? (
            <StateMsg kind="loading" title="Cargando bloqueos" />
          ) : blocks.length === 0 ? (
            <StateMsg kind="empty" title="No hay bloqueos manuales" />
          ) : (
            <div className="admin-reservation-list">
              {blocks.map((block) => {
                const image = getApartmentImages(block.apartment)[0];

                return (
                  <article key={block._id} className="admin-reservation-item">
                    <div className="admin-reservation-media" style={{ backgroundImage: `url(${image})` }} />
                    <div className="admin-reservation-summary">
                      <div className="admin-reservation-top">
                        <div>
                          <h3>{block.apartment?.title || "Apartamento no disponible"}</h3>
                          <p>{block.apartment?.city || "No disponible"}</p>
                        </div>
                        <span className="status-badge status-pending">Bloqueo</span>
                      </div>
                      <div className="reservation-meta-grid">
                        <span>Inicio: {formatDateShort(block.startDate)}</span>
                        <span>Fin: {formatDateShort(block.endDate)}</span>
                        <span>Nota: {block.note || "Sin nota"}</span>
                      </div>
                    </div>
                    <div className="admin-apartment-actions">
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === block._id}
                        onClick={() => handleDelete(block._id)}
                      >
                        {deletingId === block._id ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default AdminBlocksPage;
