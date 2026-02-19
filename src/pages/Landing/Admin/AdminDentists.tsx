import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../styles/Admin.css";

interface Dentist {
  id: number;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  experience: number;
  clinic_name: string;
  clinic_address: string;
  fees: number;
  specialization: string;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "status--confirmed",
  PENDING:  "status--pending",
  REJECTED: "status--cancelled",
};

const AdminDentists: React.FC = () => {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Dentist>>({});
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }
    fetchDentists();
  }, []);

  const fetchDentists = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/dentists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDentists(res.data);
    } catch (error) {
      console.error("Failed to fetch dentists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/dentists/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchDentists();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this dentist? This cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/dentists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchDentists();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete");
    }
  };

  const startEdit = (dentist: Dentist) => {
    setEditingId(dentist.id);
    setEditForm({ ...dentist });
  };

  const handleEditSave = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/dentists/${editingId}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      await fetchDentists();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update");
    }
  };

  const filtered = filter === "ALL"
    ? dentists
    : dentists.filter((d) => d.status === filter);

  if (loading) return <div className="admin-container"><p>Loading...</p></div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>Manage Dentists</h1>
          <p>{dentists.length} total dentists</p>
        </div>
        <button className="back-btn" onClick={() => navigate("/admin")}>
          ← Back
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? "filter-tab--active" : ""}`}
            onClick={() => setFilter(f as any)}
          >
            {f}
            <span className="filter-count">
              {f === "ALL" ? dentists.length : dentists.filter((d) => d.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Dentist Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialization</th>
              <th>Clinic</th>
              <th>Fees</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <React.Fragment key={d.id}>
                <tr>
                  <td>
                    <strong>{d.name}</strong>
                    <br />
                    <small>{d.email}</small>
                  </td>
                  <td>{d.specialization}</td>
                  <td>{d.clinic_name}</td>
                  <td>₹{d.fees}</td>
                  <td>
                    <span className={`status-badge ${STATUS_COLORS[d.status]}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      {d.status === "PENDING" && (
                        <>
                          <button
                            className="action-btn action-btn--approve"
                            onClick={() => handleStatusChange(d.id, "APPROVED")}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="action-btn action-btn--reject"
                            onClick={() => handleStatusChange(d.id, "REJECTED")}
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      {d.status === "APPROVED" && (
                        <button
                          className="action-btn action-btn--reject"
                          onClick={() => handleStatusChange(d.id, "REJECTED")}
                        >
                          Revoke
                        </button>
                      )}
                      {d.status === "REJECTED" && (
                        <button
                          className="action-btn action-btn--approve"
                          onClick={() => handleStatusChange(d.id, "APPROVED")}
                        >
                          Re-approve
                        </button>
                      )}
                      <button
                        className="action-btn action-btn--edit"
                        onClick={() => startEdit(d)}
                      >
                        ✎ Edit
                      </button>
                      <button
                        className="action-btn action-btn--delete"
                        onClick={() => handleDelete(d.id)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Inline Edit Row */}
                {editingId === d.id && (
                  <tr className="edit-row">
                    <td colSpan={6}>
                      <div className="edit-form">
                        <h4>Edit Dentist Profile</h4>
                        <div className="edit-form-grid">
                          <div className="form-group">
                            <label>Qualification</label>
                            <input
                              value={editForm.qualification || ""}
                              onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Experience (yrs)</label>
                            <input
                              type="number"
                              value={editForm.experience || ""}
                              onChange={(e) => setEditForm({ ...editForm, experience: Number(e.target.value) })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Clinic Name</label>
                            <input
                              value={editForm.clinic_name || ""}
                              onChange={(e) => setEditForm({ ...editForm, clinic_name: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Clinic Address</label>
                            <input
                              value={editForm.clinic_address || ""}
                              onChange={(e) => setEditForm({ ...editForm, clinic_address: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Fees (₹)</label>
                            <input
                              type="number"
                              value={editForm.fees || ""}
                              onChange={(e) => setEditForm({ ...editForm, fees: Number(e.target.value) })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Specialization</label>
                            <input
                              value={editForm.specialization || ""}
                              onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="edit-form-actions">
                          <button className="action-btn action-btn--approve" onClick={handleEditSave}>
                            Save Changes
                          </button>
                          <button className="action-btn action-btn--delete" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDentists;