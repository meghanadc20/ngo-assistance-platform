import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function NgoRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+91",
    address: "",
    latitude: "",
    longitude: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setError("");
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));

        setLocationLoading(false);
        setMessage("Location captured successfully.");
      },
      () => {
        setLocationLoading(false);
        setError(
          "Unable to get your location. Please allow location access and try again."
        );
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    if (!formData.latitude || !formData.longitude) {
      setError("Please capture the NGO location before submitting.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/ngo/apply", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        password: formData.password,
      });

      setMessage(
        response.data?.message ||
          "Application submitted successfully. Please wait for admin approval."
      );

      setFormData({
        name: "",
        email: "",
        phone: "+91",
        address: "",
        latitude: "",
        longitude: "",
        password: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to submit the application. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>NGO Registration</h1>

        <p className="auth-subtitle">
          Register your NGO to provide assistance through our platform.
        </p>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label>NGO Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter NGO name"
              autoComplete="organization"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter NGO email"
              autoComplete="off"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
           <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            minLength="8"
            maxLength="72"
            autoComplete="new-password"
            required
          />

        <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? "🙈" : "👁️"}
          </button>
          </div>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91XXXXXXXXXX"
              maxLength="13"
              required
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter NGO address"
              rows="3"
              required
            />
          </div>

          <div className="location-section">
            <label>NGO Location</label>

            <button
              type="button"
              className="location-btn"
              onClick={getLocation}
              disabled={locationLoading}
            >
              {locationLoading
                ? "Getting Location..."
                : " Use Current Location"}
            </button>

            {formData.latitude && formData.longitude && (
              <div className="location-info">
                <p>
                  <strong>Latitude:</strong> {formData.latitude}
                </p>
                <p>
                  <strong>Longitude:</strong> {formData.longitude}
                </p>
              </div>
            )}
          </div>
          {message && <div className="success-message">{message}</div>}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already registered?{" "}
            <Link to="/login">Login as NGO</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default NgoRegister;