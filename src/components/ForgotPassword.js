import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Disable the button after first click

    try {
      const response = await axios.post('/api/forgot-password', { email });
      setMessage("Passcode sent to your email.");
      navigate("/verify-code", { state: { email } }); // Navigate to verification page
    } catch (error) {
      setMessage("Email not found.");
    } finally {
      setLoading(false); // Re-enable the button after request completion
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <div className="icon-lock">
          <span role="img" aria-label="lock">🔒</span>
        </div>
        <h2>Reset your password</h2>
        <p>Forgot your password? Please enter your email and we'll send you a 4-digit code.</p>
        <form onSubmit={handleSubmit}>
          <input
            className="input-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Get 4-digit code"}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
