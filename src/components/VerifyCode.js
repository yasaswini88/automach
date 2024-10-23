import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./VerifyCode.css"; // Import the CSS file

const VerifyCode = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation(); // To access the passed email
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/verify-code', { 
        email: location.state.email, code 
      });
      setMessage("Code verified, proceed to reset password.");
      navigate("/reset-password", { state: { email: location.state.email } });
    } catch (error) {
      setMessage("Invalid or expired code.");
    }
  };

  return (
    <div className="verify-code-container">
      <div className="verify-code-box">
        <h2>Verify Passcode</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="input-code"
            type="text"
            placeholder="Enter 4-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button className="submit-button" type="submit">Verify</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default VerifyCode;
