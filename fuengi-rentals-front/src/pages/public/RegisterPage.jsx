import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../context";
import { loginUser, registerUser } from "../../services";

function RegisterPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Completa nombre, email y password.");
      return;
    }

    try {
      setLoading(true);
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      const loginData = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      login(loginData);
      navigate("/account");
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.message || "No se pudo completar el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-shell">
      <article className="login-card">
        <div className="login-copy">
          <p className="page-eyebrow">Crear cuenta</p>
          <h1>Registro de usuario</h1>
          <p className="page-lead">
            Crea una cuenta para poder reservar desde la web y consultar tus
            reservas en tu panel personal.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="booking-field">
            <span>Nombre</span>
            <input
              type="text"
              name="name"
              placeholder="Tu nombre"
              value={form.name}
              onChange={handleChange}
            />
          </label>

          <label className="booking-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="usuario@demo.com"
              value={form.email}
              onChange={handleChange}
            />
          </label>

          <label className="booking-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Tu contraseña"
              value={form.password}
              onChange={handleChange}
            />
          </label>

          {error && <div className="page-feedback page-feedback-error">{error}</div>}

          <button type="submit" className="site-cta site-cta-primary booking-submit" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      </article>
    </section>
  );
}

export default RegisterPage;
