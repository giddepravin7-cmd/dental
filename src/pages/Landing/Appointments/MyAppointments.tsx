import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../../../styles/MyAppointments.css';

interface Appointment {
  id: number;
  appointment_date: string;
  appointment_time: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes: string;
  payment_status: "PAID" | "UNPAID";
  clinic_name: string;
  clinic_address: string;
  fees: number;
  specialization: string;
  dentist_name: string;
  dentist_phone: string;
  dentist_email: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "status--pending",
  CONFIRMED: "status--confirmed",
  CANCELLED: "status--cancelled",
  COMPLETED: "status--completed",
};

const MyAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchAppointments = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get(
        "http://localhost:5000/api/appointments/my-appointments",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(res.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    setCancellingId(id);
    try {
      await axios.patch(
        `http://localhost:5000/api/appointments/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // ✅ Refresh list after cancel
      await fetchAppointments();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  // ✅ Fixed: format ISO date cleanly
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });

  // ✅ Fixed: strip seconds from "14:30:00"
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "-";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  if (loading) return <div className="appointments-container"><p>Loading appointments...</p></div>;

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h1>My Appointments</h1>
        <button className="book-new-btn" onClick={() => navigate("/dentists")}>
          + Book New
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="no-appointments">
          <p>You have no appointments yet.</p>
          <button onClick={() => navigate("/dentists")}>Browse Dentists</button>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map((appt) => (
            <div key={appt.id} className="appointment-card">

              <div className="appt-card-header">
                <div>
                  <h3>{appt.dentist_name}</h3>
                  <p className="appt-specialization">{appt.specialization}</p>
                </div>
                <div className="appt-badges">
                  <span className={`status-badge ${STATUS_COLORS[appt.status]}`}>
                    {appt.status}
                  </span>
                  <span className={`payment-badge ${appt.payment_status === "PAID" ? "payment--paid" : "payment--unpaid"}`}>
                    {appt.payment_status}
                  </span>
                </div>
              </div>

              <div className="appt-card-body">
                <p><strong>📅 Date:</strong> {formatDate(appt.appointment_date)}</p>
                <p><strong>🕐 Time:</strong> {formatTime(appt.appointment_time)}</p>
                <p><strong>🏥 Clinic:</strong> {appt.clinic_name}, {appt.clinic_address}</p>
                <p><strong>📞 Phone:</strong> {appt.dentist_phone}</p>
                <p><strong>💰 Fees:</strong> ₹{appt.fees}</p>
                {appt.notes && <p><strong>📝 Notes:</strong> {appt.notes}</p>}
              </div>

              {/* Only show cancel if not already cancelled or completed */}
              {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                <div className="appt-card-footer">
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancel(appt.id)}
                    disabled={cancellingId === appt.id}
                  >
                    {cancellingId === appt.id ? "Cancelling..." : "Cancel Appointment"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;