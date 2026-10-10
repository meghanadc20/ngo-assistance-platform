import { useEffect, useState } from "react";
import api from "../api";
import "../App.css";

function NgoDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState({});
  const [employeeForm, setEmployeeForm] = useState({
  name: "",
  email: "",
  phone: "",
  });
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const token = localStorage.getItem("access_token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchDashboard = async () => {
    try {
      const response = await api.get(
        "/ngo/dashboard",
        authConfig
      );

      setDashboard(response.data);
    } catch (error) {
      console.error("Failed to fetch NGO dashboard:", error);

      setError(
        error.response?.data?.detail ||
          "Failed to load NGO dashboard."
      );
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await api.get(
        "/ngo/requests",
        authConfig
      );

      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch NGO requests:", error);

      setError(
        error.response?.data?.detail ||
          "Failed to load requests."
      );
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    await Promise.all([
      fetchDashboard(),
      fetchRequests(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      setMessage("");
      setError("");

      await api.patch(
        `/ngo/requests/${requestId}/accept`,
        {},
        authConfig
      );

      setMessage("Request accepted successfully.");

      await loadDashboard();
    } catch (error) {
      console.error("Failed to accept request:", error);

      setError(
        error.response?.data?.detail ||
          "Failed to accept request."
      );
    }
  };

  const handleDecline = async (requestId) => {
    try {
      setMessage("");
      setError("");

      const response = await api.patch(
        `/ngo/requests/${requestId}/decline`,
        {},
        authConfig
      );

      setMessage(
        response.data.message ||
          "Request declined successfully."
      );

      await loadDashboard();
    } catch (error) {
      console.error("Failed to decline request:", error);

      setError(
        error.response?.data?.detail ||
          "Failed to decline request."
      );
    }
  };
  const handleAssignEmployee = async (requestId) => {
  const employeeId = selectedEmployees[requestId];

  if (!employeeId) {
    setError("Please select an employee first.");
    return;
  }

  try {
    setMessage("");
    setError("");

    await api.post(
      `/ngo/assignments/?request_id=${requestId}`,
      {
        employee_id: Number(employeeId),
      },
      authConfig
    );

    setMessage("Employee assigned successfully.");

    await loadDashboard();
  } catch (error) {
    console.error("Failed to assign employee:", error);

    setError(
      error.response?.data?.detail ||
        "Failed to assign employee."
    );
  }
};
  const handleCompleteAssignment = async (assignmentId) => {
  try {
    setMessage("");
    setError("");

    await api.patch(
      `/ngo/assignments/${assignmentId}/complete`,
      {},
      authConfig
    );

    setMessage("Assistance request completed successfully.");

    await loadDashboard();
  } catch (error) {
    console.error("Failed to complete request:", error);

    setError(
      error.response?.data?.detail ||
        "Failed to complete request."
    );
  }
};
   const handleAddEmployee = async (event) => {
  event.preventDefault();

  try {
    setMessage("");
    setError("");

    await api.post(
      "/ngo/employees/",
      employeeForm,
      authConfig
    );

    setMessage("Employee added successfully.");

    setEmployeeForm({
      name: "",
      email: "",
      phone: "",
    });

    await fetchDashboard();
  } catch (error) {
    console.error("Failed to add employee:", error);

    setError(
      error.response?.data?.detail ||
        "Failed to add employee."
    );
  }
};
  if (loading) {
    return <p>Loading NGO dashboard...</p>;
  }

  return (
    <div className="ngo-dashboard">
      <h1 className="dashboard-title">NGO Dashboard</h1>

      {dashboard && (
        <>
          <div className="ngo-welcome">
          <div>
          <h2>Welcome, {dashboard.ngo.name}</h2>
          <p>{dashboard.ngo.email}</p>
         </div>
         </div>
          <h2 className="section-title">Request Summary</h2>
          <div className="stats-grid">
            <div className="stat-card">
           <span className="stat-label">Pending</span>
           <strong>{dashboard.request_counts.pending}</strong>
          </div>

            <div className="stat-card">
             <span className="stat-label">Accepted</span>
              <strong>{dashboard.request_counts.accepted}</strong>
            </div>

           <div className="stat-card">
           <span className="stat-label">Assigned</span>
           <strong>{dashboard.request_counts.assigned}</strong>
           </div>

           <div className="stat-card">
             <span className="stat-label">Completed</span>
             <strong>{dashboard.request_counts.completed}</strong>
           </div>
          </div>

          <h2 className="section-title">Employees</h2>
           <button
  type="button"
  className="add-employee-button"
  onClick={() => setShowEmployeeForm(!showEmployeeForm)}
>
  {showEmployeeForm ? "Cancel" : "+ Add Employee"}
</button>

{showEmployeeForm && (
  <form className="employee-form" onSubmit={handleAddEmployee}>
    <input
      type="text"
      placeholder="Employee Name"
      value={employeeForm.name}
      onChange={(event) =>
        setEmployeeForm({
          ...employeeForm,
          name: event.target.value,
        })
      }
      required
    />

    <input
      type="email"
      placeholder="Employee Email"
      value={employeeForm.email}
      onChange={(event) =>
        setEmployeeForm({
          ...employeeForm,
          email: event.target.value,
        })
      }
      required
    />

    <input
      type="tel"
      placeholder="Employee Phone"
      value={employeeForm.phone}
      onChange={(event) =>
        setEmployeeForm({
          ...employeeForm,
          phone: event.target.value,
            })
          }
         required
         />
             <button type="submit">
              Save Employee
             </button>
         </form>
        )}
          {dashboard.employees.length === 0 ? (
            <p>No employees registered.</p>
          ) : (
            dashboard.employees.map((employee) => (
              <div className="employee-card" key={employee.id}>
                <h3>{employee.name}</h3>
                <p>Email: {employee.email}</p>
                <p>Phone: {employee.phone}</p>
               <p className={employee.is_available ? "status-available" : "status-unavailable"}>
               {employee.is_available ? "Available" : "Unavailable"}
              </p>
              </div>
            ))
          )}
        </>
      )}

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

      <h2 className="section-title">Assistance Requests</h2>

      {requests.length === 0 ? (
        <p>No assistance requests currently assigned.</p>
      ) : (
        requests.map((item) => (
          <div className="request-card" key={item.request_id}>
            <h3>
              Request #{item.request_id}
            </h3>

            <p>
              Type: {item.request.type}
            </p>

            <p>
              Description:{" "}
              {item.request.description ||
                "No description provided"}
            </p>

          <p>
          <span className="request-status">
              {item.request.status}
          </span>
            </p>

            {item.user && (
              <>
                <h4>User Details</h4>

                <p>
                  Name: {item.user.name}
                </p>

                <p>
                  Email: {item.user.email}
                </p>

                <p>
                  Phone: {item.user.phone}
                </p>
              </>
            )}

            {item.assigned_employee && (
              <>
                <h4>Assigned Employee</h4>

                <p>
                  Name:{" "}
                  {item.assigned_employee.name}
                </p>

                <p>
                  Phone:{" "}
                  {item.assigned_employee.phone}
                </p>
                {item.request.status === "ASSIGNED" &&
                item.assignment_id && (
               <button
                className="complete-button"
               type="button"
              onClick={() =>
              handleCompleteAssignment(item.assignment_id)
              }
             >
              Complete Request
           </button>
           )}
              </>
            )}

            {item.request.status === "PENDING" && (
              <div>
                <button
             className="accept-button"
                onClick={() => handleAccept(item.request_id)}
               >
                  Accept
                    </button>

               <button
                 className="decline-button"
                  onClick={() => handleDecline(item.request_id)}
                  >
                     Decline
               </button>
              </div>
            )}
            {item.request.status === "ACCEPTED" && (
            <div>
              <h4>Assign Employee</h4>
          <select
          value={selectedEmployees[item.request_id] || ""}
          onChange={(event) =>
          setSelectedEmployees({
          ...selectedEmployees,
          [item.request_id]: event.target.value,
         })
       }
      >
      <option value="">
        Select an available employee
      </option>

      {dashboard.employees
        .filter((employee) => employee.is_available)
        .map((employee) => (
          <option
            key={employee.id}
            value={employee.id}
          >
            {employee.name}
          </option>
        ))}
     </select>
     <button
      type="button"
      className="assign-button"
      onClick={() =>
         handleAssignEmployee(item.request_id)
       }
       >
       Assign Employee
        </button>
      </div>
      )}
          </div>
        ))
      )}
    </div>
  );
}

export default NgoDashboard;