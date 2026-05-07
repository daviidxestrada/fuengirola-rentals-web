import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Field } from "../../components";
import { AuthContext } from "../../context";
import { loginUser, registerUser } from "../../services";
import { AUTH_IMAGE } from "../../utils";

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

    if (form.password.length < 6) {
      setError("El password debe tener al menos 6 caracteres.");
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
    <div className="auth-page">
      <div className="auth-form-side">
        <div className="auth-form-inner">
          <span className="section-kicker">Crear cuenta</span>
          <h1>Registro</h1>
          <p>Crea una cuenta para enviar solicitudes y consultar el estado de tus reservas.</p>

          <form className="auth-form-fields" onSubmit={handleSubmit}>
            <Field
              label="Nombre"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Tu nombre"
              autoComplete="name"
            />
            <Field
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="usuario@demo.com"
              autoComplete="email"
            />
            <Field
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              autoComplete="new-password"
              error={error}
            />
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="auth-foot">
            Ya tienes cuenta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </div>
      <div className="auth-img-side" style={{ backgroundImage: `url(${AUTH_IMAGE})` }}>
        <div className="auth-quote">
          <span className="auth-quote-mark">"</span>
          Tu viaje a Fuengirola empieza con una solicitud sencilla.
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
