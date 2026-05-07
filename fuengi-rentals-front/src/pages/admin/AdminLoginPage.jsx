import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Field } from "../../components";
import { AuthContext } from "../../context";
import { loginUser } from "../../services";
import { AUTH_IMAGE } from "../../utils";

function AdminLoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);
      const data = await loginUser({ email, password });
      login(data);
      navigate(data.user.role === "admin" ? "/admin" : "/account");
    } catch (requestError) {
      console.error(requestError);
      setError("Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-side">
        <div className="auth-form-inner">
          <span className="section-kicker">Acceso</span>
          <h1>Login</h1>
          <p>
            Entra con tu cuenta para solicitar reservas, revisar tu panel o administrar la web.
          </p>

          <form className="auth-form-fields" onSubmit={handleSubmit}>
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="user@email.com"
              autoComplete="email"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              autoComplete="current-password"
              error={error}
            />
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? "Accediendo..." : "Entrar"}
            </button>
          </form>

          <p className="auth-foot">
            No tienes cuenta? <Link to="/register">Crear cuenta</Link>
          </p>
        </div>
      </div>
      <div className="auth-img-side" style={{ backgroundImage: `url(${AUTH_IMAGE})` }}>
        <div className="auth-quote">
          <span className="auth-quote-mark">"</span>
          Despertar cerca del Mediterraneo, sin complicaciones.
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
