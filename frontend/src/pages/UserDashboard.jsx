import { useEffect, useState } from "react";
import api from "../api";
import "../App.css";

function UserDashboard() {
  const [requests, setRequests] = useState([]);
  const [requestType, setRequestType] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  const token = localStorage.getItem("access_token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchRequests = async () => {
    try {
      const response = await api.get(
        "/requests/my",
        authConfig
      );

      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);

      setError(
        error.response?.data?.detail ||
          "Failed to load your requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
        async (position) => {
   const latitude = position.coords.latitude;
   const longitude = position.coords.longitude;

   setLatitude(latitude);
   setLongitude(longitude);

   try {
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

    setLocationAddress(data.display_name);
  } catch (error) {
    console.error("Reverse geocoding error:", error);

    setLocationAddress(
      "Location detected, but address could not be found."
    );
  } finally {
    setLocationLoading(false);
  }
  },
      (error) => {
        console.error("Location error:", error);
        setError(
          "Unable to get your location. Please allow location access."
        );

        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!latitude || !longitude) {
      setError("Please share your location before submitting.");
      return;
    }

    try {
      const response = await api.post(
        "/requests/",
        {
          request_type: requestType,
          description: description || null,
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
        authConfig
      );

      setMessage(
        `Request created successfully. Assigned NGO: ${response.data.assigned_ngo_name}`
      );

      setRequestType("");
      setDescription("");
      setLatitude("");
      setLongitude("");

      await fetchRequests();
    } catch (error) {
      console.error("Failed to create request:", error);

      setError(
        error.response?.data?.detail ||
          "Failed to create assistance request."
      );
    }
  };

  if (loading) {
    return <p>Loading User Dashboard...</p>;
  }

  return (
    <div className="user-dashboard">
      <h1 className="user-dashboard-title">User Dashboard</h1>
      <section className="request-assistance-section">
      <h2 className="user-section-title">Request Assistance</h2>
     <form className="assistance-form" onSubmit={handleSubmit}>
        <select
          value={requestType}
          onChange={(event) =>
            setRequestType(event.target.value)
          }
          required
        >
          <option value="">Select assistance type</option>
          <option value="Medical">Medical</option>
          <option value="Emergency">Emergency</option>
          <option value="Food">Food</option>
          <option value="Shelter">Shelter</option>
          <option value="Counseling">Counseling</option>
        </select>

        <textarea
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="Describe the assistance you need"
          maxLength={1000}
        />

        <button
         type="button"
         className="user-location-button"
         onClick={getCurrentLocation}
         disabled={locationLoading}
        >
        {locationLoading
         ? "Getting Location..."
          : "Use Current Location"}
        </button>

        {locationAddress && (
         <div className="user-location-display">
           <span className="location-pin">📍</span>
          <div>
       <strong>Current Location</strong>
        <p>{locationAddress}</p>
        </div>
        </div>
        )}

        <button type="submit" className="submit-request-button">
        Submit Request
       </button>
      </form>
    </section>
      {message && (
        <p className="success-message">
          {message}
        </p>
      )}

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      <h2 className="user-section-title">My Assistance Requests</h2>

      {requests.length === 0 ? (
        <p>No assistance requests yet.</p>
      ) : (
        requests.map((request) => (
             <div
             className="user-request-card"
            key={request.request_id}
             >
            <h3>
              Request #{request.request_id}
            </h3>

            <p>
              Type: {request.request_type}
            </p>

            <p>
              Description:{" "}
              {request.description ||
                "No description provided"}
            </p>

             <p>
              <span className="user-status-label">Status</span>
              <span
              className={`user-request-status status-${request.status.toLowerCase()}`}
              >
             {request.status}
              </span>
             </p>

             {request.ngo && (
                   <div className="assigned-info">
                 <h4>Assigned NGO</h4>
                <p>
                  Name: {request.ngo.name}
                </p>

                <p>
                  Phone: {request.ngo.phone}
                </p>

                <p>
                  Address: {request.ngo.address}
                </p>
              </div>
            )}

           {request.assigned_employee && (
               <div className="assigned-info">
                  <h4>Assigned Employee</h4>
                <p>
                  Name:{" "}
                  {request.assigned_employee.name}
                </p>

                <p>
                  Phone:{" "}
                  {request.assigned_employee.phone}
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default UserDashboard;