import { useEffect, useState } from "react";

import { Field } from "../../components";
import {
  createApartment,
  deleteApartment,
  getAdminApartments,
  syncBookingCalendar,
  updateApartment,
} from "../../services";
import { getApartmentImages } from "../../utils";

const initialForm = {
  title: "",
  description: "",
  city: "Fuengirola",
  price: "",
  images: [],
  featuresText: "",
  bookingCalendarUrl: "",
};

const toFormState = (apartment) => ({
  title: apartment.title ?? "",
  description: apartment.description ?? "",
  city: apartment.city ?? "Fuengirola",
  price: apartment.price ?? "",
  images: apartment.images ?? [],
  featuresText: Array.isArray(apartment.features) ? apartment.features.join("\n") : "",
  bookingCalendarUrl: apartment.bookingCalendarUrl ?? "",
});

const formatSyncDate = (value) =>
  value
    ? new Date(value).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Sin sincronizar";

const parseFeatures = (value) =>
  value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

function AdminApartmentsPage() {
  const [apartments, setApartments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadApartments = async () => {
    try {
      setLoading(true);
      const data = await getAdminApartments();
      setApartments(data);
    } catch (requestError) {
      console.error(requestError);
      setError("No se pudieron cargar los apartamentos del panel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApartments();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleEdit = (apartment) => {
    setEditingId(apartment._id);
    setForm(toFormState(apartment));
    setError("");
    setMessage("Editando apartamento seleccionado.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    try {
      const uploadedImages = await Promise.all(
        files.map(
          (file) =>
            new Promise((resolve, reject) => {
              if (!file.type.startsWith("image/")) {
                reject(new Error("Solo se permiten archivos de imagen."));
                return;
              }

              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = () => reject(new Error("No se pudo leer una de las imagenes."));
              reader.readAsDataURL(file);
            })
        )
      );

      setForm((currentForm) => ({
        ...currentForm,
        images: [...currentForm.images, ...uploadedImages],
      }));
      setError("");
      setMessage("Imagenes adjuntadas correctamente.");
    } catch (uploadError) {
      console.error(uploadError);
      setError(uploadError.message || "No se pudieron adjuntar las imagenes.");
      setMessage("");
    } finally {
      event.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setForm((currentForm) => ({
      ...currentForm,
      images: currentForm.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.title.trim() || !form.description.trim() || !form.city.trim() || !String(form.price).trim()) {
      setError("Completa titulo, descripcion, ciudad y precio.");
      return;
    }

    const numericPrice = Number(form.price);

    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setError("El precio debe ser un numero mayor que 0.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      city: form.city.trim(),
      price: numericPrice,
      images: form.images,
      features: parseFeatures(form.featuresText),
      bookingCalendarUrl: form.bookingCalendarUrl.trim(),
    };

    try {
      setSaving(true);

      if (editingId) {
        await updateApartment(editingId, payload);
        setMessage("Apartamento actualizado correctamente.");
      } else {
        await createApartment(payload);
        setMessage("Apartamento creado correctamente.");
      }

      resetForm();
      await loadApartments();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || "No se pudo guardar el apartamento.");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncBookingCalendar = async (apartmentId) => {
    try {
      setSyncingId(apartmentId);
      setError("");
      setMessage("");

      const result = await syncBookingCalendar(apartmentId);

      setApartments((currentApartments) =>
        currentApartments.map((apartment) =>
          apartment._id === apartmentId ? result.apartment : apartment
        )
      );
      setMessage(`Calendario Booking sincronizado: ${result.importedCount} fechas importadas.`);
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || "No se pudo sincronizar Booking.");
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = async (apartmentId) => {
    const confirmed = window.confirm("Se eliminara el apartamento seleccionado. Quieres continuar?");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(apartmentId);
      setError("");
      setMessage("");
      await deleteApartment(apartmentId);

      if (editingId === apartmentId) {
        resetForm();
      }

      setApartments((currentApartments) =>
        currentApartments.filter((apartment) => apartment._id !== apartmentId)
      );
      setMessage("Apartamento eliminado correctamente.");
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || "No se pudo eliminar el apartamento.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Apartamentos</h1>
          <p>Gestiona fotos, textos, precio, servicios y calendario iCal de Booking.com.</p>
        </div>
        {editingId ? (
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            Cancelar edicion
          </button>
        ) : null}
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
              <h2>{editingId ? "Editar apartamento" : "Nuevo apartamento"}</h2>
              <p>Las fotos se guardan junto al apartamento en la base de datos.</p>
            </div>
          </div>

          <form className="admin-form" onSubmit={handleSubmit}>
            <Field label="Titulo" name="title" value={form.title} onChange={handleChange} placeholder="Apartamento con terraza" />
            <div className="field-row">
              <Field label="Ciudad" name="city" value={form.city} onChange={handleChange} placeholder="Fuengirola" />
              <Field
                label="Precio por noche"
                type="number"
                name="price"
                min="1"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="120"
              />
            </div>
            <Field
              label="Descripcion"
              name="description"
              as="textarea"
              rows={5}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe el apartamento y sus puntos fuertes."
            />
            <Field
              label="Servicios destacados"
              name="featuresText"
              as="textarea"
              rows={4}
              value={form.featuresText}
              onChange={handleChange}
              placeholder={"Cerca de la playa\nTerraza privada\nWiFi"}
            />
            <label className="field">
              <span className="field-label">Imagenes</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
            </label>
            <Field
              label="URL iCal de Booking"
              type="url"
              name="bookingCalendarUrl"
              value={form.bookingCalendarUrl}
              onChange={handleChange}
              placeholder="https://admin.booking.com/hotel/hoteladmin/ical.html?..."
            />

            {form.images.length > 0 ? (
              <div className="img-manager">
                {form.images.map((image, index) => (
                  <div key={`${index}-${image.slice(0, 20)}`} className="img-thumb" style={{ backgroundImage: `url(${image})` }}>
                    <button
                      type="button"
                      className="img-thumb-remove"
                      onClick={() => handleRemoveImage(index)}
                      aria-label="Quitar imagen"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear apartamento"}
            </button>
          </form>
        </section>

        <section className="admin-section admin-list-card">
          <div className="admin-section-head">
            <div>
              <h2>Catalogo actual</h2>
              <p>{loading ? "Cargando apartamentos..." : `${apartments.length} apartamentos en el panel.`}</p>
            </div>
          </div>

          {loading ? (
            <p>Cargando apartamentos...</p>
          ) : apartments.length === 0 ? (
            <p>No hay apartamentos creados todavia.</p>
          ) : (
            <div className="admin-apartment-list">
              {apartments.map((apartment) => {
                const image = getApartmentImages(apartment)[0];
                const syncStatus =
                  apartment.lastBookingCalendarSyncStatus === "error"
                    ? "sync-error"
                    : apartment.bookingCalendarUrl
                      ? "sync-ok"
                      : "sync-pending";

                return (
                  <article key={apartment._id} className="admin-apartment-item">
                    <div className="admin-apartment-photo" style={{ backgroundImage: `url(${image})` }} />
                    <div className="admin-apartment-summary">
                      <h3>{apartment.title}</h3>
                      <p>{apartment.city} - {apartment.price} EUR/noche</p>
                      <p>{apartment.description}</p>
                      <div className="admin-feature-tags">
                        {(apartment.features || []).slice(0, 4).map((feature) => (
                          <span key={feature}>{feature}</span>
                        ))}
                      </div>
                      <div className="admin-sync-panel">
                        <span className={`sync-status ${syncStatus}`}>
                          {apartment.bookingCalendarUrl ? "Booking configurado" : "Booking pendiente"}
                        </span>
                        <p>Ultima sync: {formatSyncDate(apartment.lastBookingCalendarSyncAt)}</p>
                        <p>Fechas importadas: {apartment.lastBookingCalendarImportedCount || 0}</p>
                        {apartment.lastBookingCalendarSyncMessage ? (
                          <p>{apartment.lastBookingCalendarSyncMessage}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="admin-apartment-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleEdit(apartment)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === apartment._id}
                        onClick={() => handleDelete(apartment._id)}
                      >
                        {deletingId === apartment._id ? "Eliminando..." : "Eliminar"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={!apartment.bookingCalendarUrl || syncingId === apartment._id}
                        onClick={() => handleSyncBookingCalendar(apartment._id)}
                      >
                        {syncingId === apartment._id ? "Sincronizando..." : "Sincronizar"}
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

export default AdminApartmentsPage;
