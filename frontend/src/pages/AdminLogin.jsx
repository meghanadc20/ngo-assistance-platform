import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../App.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/admin/login", {
        email,
        password,
      });

      const token = response.data.access_token;

      localStorage.setItem("access_token", token);
      localStorage.setItem("role", "admin");

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin login error:", error);

      setMessage(
        error.response?.data?.detail ||
          "Invalid admin credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-brand">
          <h1>Platform Administration</h1>

          <p>
            Manage NGO verification, platform operations,
            and registered organizations.
          </p>

          <p className="brand-tagline">
            Authorized personnel only.
          </p>
        </div>

        <div className="auth-card">

          <h2>Admin Login</h2>

          <p className="auth-subtitle">
            Sign in to access the platform administration portal.
          </p>

          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            <div className="form-group">
              <label htmlFor="admin-email">
                Email
              </label>

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter admin email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">
                Password
              </label>

              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter admin password"
                required
              />
            </div>

            {message && (
              <div className="auth-message">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Admin Sign In"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/")}
            >
              Back to Main Login
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}

export default AdminLogin;