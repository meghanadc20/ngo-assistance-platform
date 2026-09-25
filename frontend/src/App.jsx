import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />
         
         <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        <Route
          path="/user/dashboard"
          element={<UserDashboard />}
        />

        <Route
          path="/ngo/dashboard"
          element={<NgoDashboard />}
        />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


// import { useEffect, useState } from "react";
// import api from "./api";

// function App() {
//   const [message, setMessage] = useState("Connecting to backend...");

//   useEffect(() => {
//     api
//       .get("/")
//       .then((response) => {
//         setMessage(response.data.message);
//       })
//       .catch((error) => {
//         console.error("Backend connection error:", error);
//         setMessage("Could not connect to backend");
//       });
//   }, []);

//   return (
//     <div>
//       <h1>NGO Assistance Platform</h1>

//       <p>{message}</p>
//     </div>
//   );
// }
// export default App;