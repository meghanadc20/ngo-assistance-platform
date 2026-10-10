import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "../App.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    location: "",
    latitude: null,
    longitude: null,
    password: "",
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const getCurrentLocation = () => {
    setLocationMessage("");
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setLocationMessage(
        "Location services are not supported by your browser."
      );
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          /*
           * Convert coordinates into a readable address.
           * This is fine for our development version.
           */
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
             {
                headers: {
                  "Accept-Language": "en",
             },
             }
          );

          if (!response.ok) {
            throw new Error("Unable to find your address.");
          }

          const data = await response.json();

          const address = data.display_name;

          setFormData((previous) => ({
            ...previous,
            location: address,
            latitude: latitude,
            longitude: longitude,
          }));

          setLocationMessage("Location detected successfully.");
        } catch (error) {
          console.error("Reverse geocoding error:", error);

          setLocationMessage(
            "Location detected, but we could not find the address."
          );

          // Still save coordinates even if address lookup fails.
          setFormData((previous) => ({
            ...previous,
            location: `${latitude}, ${longitude}`,
            latitude: latitude,
            longitude: longitude,
          }));
        } finally {
          setLocationLoading(false);
        }
      },

      (error) => {
        console.error("Geolocation error:", error);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage(
            "Location permission was denied. Please allow location access and try again."
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationMessage(
            "Your location could not be determined. Please try again."
          );
        } else if (error.code === error.TIMEOUT) {
          setLocationMessage(
            "Location request timed out. Please try again."
          );
        } else {
          setLocationMessage(
            "Unable to get your location. Please try again."
          );
        }

        setLocationLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  setMessage("");

  // Validate Indian mobile number
  if (!/^[6-9][0-9]{9}$/.test(formData.phone)) {
    setMessage(
      "Please enter a valid 10-digit Indian mobile number."
    );
    return;
  }

  // Validate location
  if (
    formData.latitude === null ||
    formData.longitude === null ||
    !formData.location
  ) {
    setMessage(
      "Please allow location access and select your current location before registering."
    );
    return;
  }

  setLoading(true);

  try {
    // Add +91 before sending phone number to backend
    const registrationData = {
      ...formData,
      phone: `+91${formData.phone}`,
    };

    await api.post("/auth/register", registrationData);

    setMessage(
      "Registration successful! Redirecting to login..."
    );

    setTimeout(() => {
      navigate("/");
    }, 1200);

  } catch (error) {
    console.error("Registration error:", error);

    setMessage(
      error.response?.data?.detail ||
        "Registration failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-brand">
          <h1>Join the Platform</h1>

          <p>
            Create an account to request assistance and
            keep track of your support requests.
          </p>

          <p className="brand-tagline">
            Help is just a request away.
          </p>
        </div>

        <div className="auth-card">

          <h2>Create Account</h2>

          <p className="auth-subtitle">
            Enter your details to get started.
          </p>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">
              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
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
          <label htmlFor="phone">
           Phone Number
          </label>

  <div className="phone-input-wrapper">
    <span className="country-code">+91</span>

    <input
      id="phone"
      name="phone"
      type="tel"
      inputMode="numeric"
      value={formData.phone}
      onChange={(event) => {
        const value = event.target.value
          .replace(/\D/g, "")
          .slice(0, 10);

        setFormData((previous) => ({
          ...previous,
          phone: value,
        }));
      }}
      placeholder="10-digit mobile number"
      maxLength={10}
      required
    />
       </div>
        <small className="input-hint">
         Enter your 10-digit Indian mobile number
       </small>
         </div>
            <div className="form-group">
              <label htmlFor="date_of_birth">
                Date of Birth
              </label>

              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
              />
            </div>

            {/* LOCATION */}
            <div className="form-group">
              <label>
                Your Location
              </label>

              <button
                type="button"
                className="location-button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
              >
                {locationLoading
                  ? "Detecting your location..."
                  : " Use My Current Location"}
              </button>

              {formData.location && (
                <div className="selected-location">
                  <div>
                    <strong>Location detected</strong>

                    <p>
                      {formData.location}
                    </p>
                  </div>
                </div>
              )}

              {locationMessage && (
                <div className="location-message">
                  {locationMessage}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>

          </form>

          <div className="auth-footer">
            Already have an account?{" "}
            <Link to="/">
              Sign in
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Register;