import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../context";
import { loginUser } from "../../services";

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
    <section className="login-shell">
      <article className="login-card">
        <div className="login-copy">
          <p className="page-eyebrow">Acceso</p>
          <h1>Login</h1>
          <p className="page-lead">
            Entra con tu cuenta para reservar apartamentos, consultar tus
            reservas o acceder al panel.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="booking-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="user@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="booking-field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && <div className="page-feedback page-feedback-error">{error}</div>}

          <button type="submit" className="site-cta site-cta-primary booking-submit" disabled={loading}>
            {loading ? "Accediendo..." : "Entrar"}
          </button>
        </form>
      </article>
    </section>
  );
}

export default AdminLoginPage;
