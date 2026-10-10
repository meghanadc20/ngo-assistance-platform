
// import { useEffect, useState } from "react";
// import api from "../api";
// import "../App.css";

// function AdminDashboard() {
//   const [ngos, setNgos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [processingId, setProcessingId] = useState(null);

//   const token = localStorage.getItem("access_token");

//   const fetchPendingNGOs = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await api.get("/admin/ngos/pending", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setNgos(response.data);
//     } catch (error) {
//       console.error("Failed to fetch pending NGOs:", error);
//       setError(
//         error.response?.data?.detail ||
//           "Failed to load pending NGO applications."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPendingNGOs();
//   }, []);

//   const handleDecision = async (ngoId, decision) => {
//     try {
//       setMessage("");
//       setError("");
//       setProcessingId(ngoId);

//       await api.patch(
//         `/admin/ngos/${ngoId}/${decision}`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setMessage(
//         decision === "approve"
//           ? "NGO approved successfully."
//           : "NGO rejected successfully."
//       );

//       await fetchPendingNGOs();
//     } catch (error) {
//       console.error(`Failed to ${decision} NGO:`, error);
//       setError(
//         error.response?.data?.detail ||
//           `Failed to ${decision} NGO.`
//       );
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   return (
//     <main className="admin-dashboard">
//       <header className="admin-dashboard-header">
//         <div>
//           <p className="admin-eyebrow">ADMINISTRATION</p>
//           <h1>Platform Admin Dashboard</h1>
//           <p className="admin-dashboard-description">
//             Review NGO applications and manage platform verification.
//           </p>
//         </div>

//         <button
//           type="button"
//           className="admin-refresh-button"
//           onClick={fetchPendingNGOs}
//           disabled={loading || processingId !== null}
//         >
//           {loading ? "Refreshing..." : "Refresh"}
//         </button>
//       </header>

//       <section className="admin-pending-section">
//         <div className="admin-section-heading">
//           <div>
//             <h2>Pending NGO Applications</h2>
//             <p>Review each organization before approving access.</p>
//           </div>

//           <span className="admin-count-badge">
//             {ngos.length} pending
//           </span>
//         </div>

//         {message && (
//           <p className="success-message" role="status">
//             {message}
//           </p>
//         )}

//         {error && (
//           <p className="error-message" role="alert">
//             {error}
//           </p>
//         )}

//         {loading ? (
//           <div className="admin-empty-state">
//             Loading pending applications...
//           </div>
//         ) : error && ngos.length === 0 ? (
//           <div className="admin-empty-state">
//             Unable to load applications. Use Refresh to try again.
//           </div>
//         ) : ngos.length === 0 ? (
//           <div className="admin-empty-state">
//             <span className="admin-empty-icon">✓</span>
//             <h3>All caught up!</h3>
//             <p>There are no pending NGO applications right now.</p>
//           </div>
//         ) : (
//           <div className="admin-ngo-grid">
//             {ngos.map((ngo) => (
//               <article className="admin-ngo-card" key={ngo.id}>
//                 <div className="admin-ngo-card-header">
//                   <div className="admin-ngo-avatar">
//                     {ngo.name?.charAt(0)?.toUpperCase() || "N"}
//                   </div>

//                   <span className="admin-pending-badge">
//                     Pending review
//                   </span>
//                 </div>

//                 <h3>{ngo.name}</h3>

//                 <div className="admin-ngo-details">
//                   <div className="admin-detail-row">
//                     <span className="admin-detail-label">Email</span>
//                     <span>{ngo.email || "Not provided"}</span>
//                   </div>

//                   <div className="admin-detail-row">
//                     <span className="admin-detail-label">Phone</span>
//                     <span>{ngo.phone || "Not provided"}</span>
//                   </div>

//                   <div className="admin-detail-row">
//                     <span className="admin-detail-label">Address</span>
//                     <span>{ngo.address || "Not provided"}</span>
//                   </div>
//                 </div>

//                 <div className="admin-ngo-actions">
//                   <button
//                     type="button"
//                     className="admin-approve-button"
//                     disabled={processingId !== null}
//                     onClick={() => handleDecision(ngo.id, "approve")}
//                   >
//                     {processingId === ngo.id
//                       ? "Processing..."
//                       : "Approve"}
//                   </button>

//                   <button
//                     type="button"
//                     className="admin-reject-button"
//                     disabled={processingId !== null}
//                     onClick={() => handleDecision(ngo.id, "reject")}
//                   >
//                     Reject
//                   </button>
//                 </div>
//               </article>
//             ))}
//           </div>
//         )}
//       </section>
//     </main>
//   );
// }

// export default AdminDashboard;

import { useEffect, useState } from "react";
import api from "../api";
import "../App.css";

function AdminDashboard() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const token = localStorage.getItem("access_token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/ngos", authConfig);
      setNgos(response.data);
    } catch (err) {
      console.error("Failed to fetch NGOs:", err);
      setError(
        err.response?.data?.detail || "Failed to load NGO records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNGOs();
  }, []);

  const handleAction = async (ngoId, action) => {
    try {
      setMessage("");
      setError("");
      setProcessingId(ngoId);

      await api.patch(
        `/admin/ngos/${ngoId}/${action}`,
        {},
        authConfig
      );

      const messages = {
        approve: "NGO approved successfully.",
        reject: "NGO rejected successfully.",
        deactivate: "NGO deactivated successfully.",
      };

      setMessage(messages[action]);
      await fetchNGOs();
    } catch (err) {
      console.error(`Failed to ${action} NGO:`, err);
      setError(
        err.response?.data?.detail ||
          `Failed to ${action} NGO.`
      );
    } finally {
      setProcessingId(null);
    }
  };

  const pendingNGOs = ngos.filter(
    (ngo) => !ngo.is_verified && ngo.is_active
  );

  const approvedNGOs = ngos.filter(
    (ngo) => ngo.is_verified && ngo.is_active
  );

  const rejectedNGOs = ngos.filter(
    (ngo) => !ngo.is_verified && !ngo.is_active
  );

  const renderNGOCard = (ngo, section) => (
    <article className="admin-ngo-card" key={ngo.id}>
      <div className="admin-ngo-card-header">
        <div className="admin-ngo-avatar">
          {ngo.name?.charAt(0)?.toUpperCase() || "N"}
        </div>

        <span className={`admin-ngo-status status-${section}`}>
          {section === "pending"
            ? "Pending review"
            : section === "approved"
              ? "Approved"
              : "Rejected"}
        </span>
      </div>

      <h3>{ngo.name}</h3>

      <div className="admin-ngo-details">
        <div className="admin-detail-row">
          <span className="admin-detail-label">Email</span>
          <span>{ngo.email || "Not provided"}</span>
        </div>

        <div className="admin-detail-row">
          <span className="admin-detail-label">Phone</span>
          <span>{ngo.phone || "Not provided"}</span>
        </div>

        <div className="admin-detail-row">
          <span className="admin-detail-label">Address</span>
          <span>{ngo.address || "Not provided"}</span>
        </div>
      </div>

      {section !== "rejected" && (
        <div className="admin-ngo-actions">
          {section === "pending" ? (
            <>
              <button
                type="button"
                className="admin-approve-button"
                disabled={processingId !== null}
                onClick={() => handleAction(ngo.id, "approve")}
              >
                {processingId === ngo.id ? "Processing..." : "Approve"}
              </button>

              <button
                type="button"
                className="admin-reject-button"
                disabled={processingId !== null}
                onClick={() => handleAction(ngo.id, "reject")}
              >
                Reject
              </button>
            </>
          ) : (
            <button
              type="button"
              className="admin-reject-button"
              disabled={processingId !== null}
              onClick={() => handleAction(ngo.id, "deactivate")}
            >
              {processingId === ngo.id
                ? "Processing..."
                : "Deactivate NGO"}
            </button>
          )}
        </div>
      )}
    </article>
  );

  const renderSection = (title, section, list, description) => (
    <section className="admin-pending-section" key={section}>
      <div className="admin-section-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <span className="admin-count-badge">
          {list.length} {list.length === 1 ? "NGO" : "NGOs"}
        </span>
      </div>

      {list.length === 0 ? (
        <div className="admin-empty-state">
          {section === "pending"
            ? "No pending applications right now."
            : section === "approved"
              ? "No approved NGOs to display."
              : "No rejected applications to display."}
        </div>
      ) : (
        <div className="admin-ngo-grid">
          {list.map((ngo) => renderNGOCard(ngo, section))}
        </div>
      )}
    </section>
  );

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <p className="admin-eyebrow">ADMINISTRATION</p>
          <h1>Platform Admin Dashboard</h1>
          <p className="admin-dashboard-description">
            Review applications and manage registered NGOs.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={fetchNGOs}
          disabled={loading || processingId !== null}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {message && (
        <p className="success-message" role="status">{message}</p>
      )}

      {error && (
        <p className="error-message" role="alert">{error}</p>
      )}

      {loading ? (
        <div className="admin-empty-state">Loading NGO records...</div>
      ) : (
        <>
          {renderSection(
            "Pending NGO Applications",
            "pending",
            pendingNGOs,
            "Review new organizations before granting access."
          )}

          {renderSection(
            "Approved NGOs",
            "approved",
            approvedNGOs,
            "Verified organizations currently active on the platform."
          )}

          {renderSection(
            "Rejected NGOs",
            "rejected",
            rejectedNGOs,
            "Applications that were rejected by the administrator."
          )}
        </>
      )}
    </main>
  );
}

export default AdminDashboard;
