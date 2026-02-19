import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../../styles/Dashboard.css';

interface User {
  name: string;
  email: string;
  role: "PATIENT" | "DENTIST";
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
      return;
    }

    // ✅ Fixed: read from localStorage "user" object (saved at login)
    // Old code was decoding JWT which only had id + role, NOT name/email
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        navigate("/login");
      }
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <h1>Welcome back, {user.name.split(" ")[0]}! 👋</h1>
        <p className="dashboard-email">{user.email}</p>
        <span className={`dashboard-role-badge ${user.role === "DENTIST" ? "badge--dentist" : "badge--patient"}`}>
          {user.role}
        </span>
      </div>

      <div className="dashboard-buttons">
        <button onClick={() => navigate("/dentists")}>
          🦷 Browse Dentists
        </button>
        <button onClick={() => navigate("/my-appointments")}>
          📅 My Appointments
        </button>
        {/* Show dentist dashboard link only for dentists */}
        {user.role === "DENTIST" && (
          <button onClick={() => navigate("/dentist/dashboard")}>
            🏥 Dentist Panel
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;