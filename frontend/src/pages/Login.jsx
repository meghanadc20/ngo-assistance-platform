import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "../App.css";

function Login() {
  const [role, setRole] = useState(null);

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
      let endpoint = "";

      if (role === "user") {
        endpoint = "/auth/login";
      } else if (role === "ngo") {
        endpoint = "/ngo/login";
      } else if (role === "admin") {
        endpoint = "/admin/login";
      }

      const response = await api.post(endpoint, {
        email,
        password,
      });

      const token = response.data.access_token;

      localStorage.setItem("access_token", token);
      localStorage.setItem("role", role);

      if (role === "user") {
        navigate("/user/dashboard");
      } else if (role === "ngo") {
        navigate("/ngo/dashboard");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        error.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="auth-page">
        <div className="auth-container">

          <div className="auth-brand">
            <h1>NGO Assistance Platform</h1>

            <p>
              Connecting elderly and specially-abled individuals
              with verified NGOs for essential assistance.
            </p>

            <p className="brand-tagline">
              Request help. Connect with support. Make a difference.
            </p>
          </div>

          <div className="auth-card">
            <h2>Welcome</h2>

            <p className="auth-subtitle">
              Select how you want to sign in.
            </p>

            <div className="role-selection">

              <button
                className="role-button"
                onClick={() => setRole("user")}
              >
                <span className="role-title">
                  User
                </span>

                <span className="role-description">
                  Request assistance and track your requests.
                </span>
              </button>

              <button
                className="role-button"
                onClick={() => setRole("ngo")}
              >
                <span className="role-title">
                  NGO
                </span>

                <span className="role-description">
                  Manage assistance requests and employees.
                </span>
              </button>
            </div>

            <div className="auth-footer">
              New user?{" "}
              <Link to="/register">
                Create an account
              </Link>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-brand">
          <h1>NGO Assistance Platform</h1>

          <p>
            Secure access to your assistance platform account.
          </p>
        </div>

        <div className="auth-card">

          <h2>
            {role === "user" && "User Login"}
            {role === "ngo" && "NGO Login"}
            {role === "admin" && "Admin Login"}
          </h2>

          <p className="auth-subtitle">
            Enter your credentials to continue.
          </p>

          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
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
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setRole(null);
                setEmail("");
                setPassword("");
                setMessage("");
              }}
            >
              Back
            </button>

          </form>

          {role === "user" && (
            <div className="auth-footer">
              Don't have an account?{" "}
              <Link to="/register">
                Create an account
              </Link>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Login;