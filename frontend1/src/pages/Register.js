import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/register", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <h1>Create account</h1>
          <p>Join the platform to report and recover items faster.</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <label>Full name</label>
          <input type="text" name="name" placeholder="Vani Garg" onChange={handleChange} required />

          <label>Email</label>
          <input type="email" name="email" placeholder="you@example.com" onChange={handleChange} required />

          <label>Password</label>
          <input type="password" name="password" placeholder="Choose a password" onChange={handleChange} required />

          {error && <p className="error">{error}</p>}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;