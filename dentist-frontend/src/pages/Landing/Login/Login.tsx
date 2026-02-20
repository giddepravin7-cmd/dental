import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../../../styles/Login.css';

const Login: React.FC = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // ✅ Save both token AND user object
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Notify Navbar to update immediately
      window.dispatchEvent(new Event("authChange"));

      // ✅ Role-based redirect
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "DENTIST") {
        navigate("/dentist/dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err: any) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <p className="login-error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="login-register-link">
          Don't have an account?{" "}
          <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
};

export default Login;