import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../styles/Admin.css";

interface Stats {
  totalUsers: number;
  totalDentists: number;
  pendingDentists: number;
  approvedDentists: number;
  totalAppointments: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="admin-container"><p>Loading...</p></div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card--blue">
          <h3>{stats?.totalUsers}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card stat-card--green">
          <h3>{stats?.approvedDentists}</h3>
          <p>Approved Dentists</p>
        </div>
        <div className="stat-card stat-card--orange">
          <h3>{stats?.pendingDentists}</h3>
          <p>Pending Approvals</p>
        </div>
        <div className="stat-card stat-card--purple">
          <h3>{stats?.totalAppointments}</h3>
          <p>Total Appointments</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-actions">
        <h2>Manage</h2>
        <div className="action-buttons">
          <button onClick={() => navigate("/admin/dentists")}>
            🦷 Manage Dentists
            {stats?.pendingDentists ? (
              <span className="pending-badge">{stats.pendingDentists} pending</span>
            ) : null}
          </button>
          <button onClick={() => navigate("/admin/users")}>
            👥 Manage Users
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;