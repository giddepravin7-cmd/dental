import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import '../../../styles/Register.css';

const Register: React.FC = () => {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]       = useState("PATIENT");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        phone,
        password,
        role, // ✅ send selected role
      });

      alert(res.data.message);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form-container">
      <form className="register-form" onSubmit={handleRegister}>
        <h2>Create Account</h2>
        <p className="register-subtitle">Join as a patient or dentist</p>

        {error && <p className="register-error">{error}</p>}

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            placeholder="9999999999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* ✅ Role Selector */}
        <div className="form-group">
          <label>Register As</label>
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${role === "PATIENT" ? "role-btn--active" : ""}`}
              onClick={() => setRole("PATIENT")}
            >
              🧑 Patient
            </button>
            <button
              type="button"
              className={`role-btn ${role === "DENTIST" ? "role-btn--active" : ""}`}
              onClick={() => setRole("DENTIST")}
            >
              🦷 Dentist
            </button>
          </div>
        </div>

        {/* Show note when DENTIST is selected */}
        {role === "DENTIST" && (
          <div className="dentist-note">
            ℹ️ After registering, you'll need to fill in your clinic details.
            Your profile will be visible after admin approval.
          </div>
        )}

        <button type="submit" className="register-submit-btn" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="register-login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;