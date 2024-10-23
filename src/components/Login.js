import React, { useState } from "react";
// import imglogo from "./automachlogo.png";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [keepMeSignedIn,setKeepMeSignedIn]=useState(true);


    const navigate = useNavigate(); // Use useNavigate hook

    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === "username") {
            setUsername(value);
        } else if (name === "password") {
            setPassword(value);
        }
    };
    const handleCheckboxChange= (e) =>
      {
        setKeepMeSignedIn(e.target.checked);
      };

    const handleSubmit = (event) => {
        event.preventDefault();

        console.log("USERNAME: ", username);
        console.log("PASSWORD: ", password);

        if (username === "yromala" && password === "Anusha123") {
            alert("Successfully Loggedin 😀");
        } else {
            alert("Login Failed !!! 😡");
        }
    };

    const handleRegister = () => {
      navigate("/signup"); // Navigate to the signup page
  };

    const handleForgotPassword = () =>
      {
        alert("Navigate to foreget password page");
      };
    return (
        <div className="login-container">
          <div className="header">
          

          <h2>Welcome Back <span>👋</span></h2>
          <p>Let’s explore the app again with us.</p></div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={username}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="keepMeSignedIn"
                        checked={keepMeSignedIn}
                        onChange={handleCheckboxChange}
                      />
                      Keep Me Signed In
                    </label>
                  </div>
                <button type="submit" className="login-button">
                    Login
                </button>
                <br></br>
                <button type="button" onClick={handleForgotPassword} className="forgot-password-button">
                        Forgot Password?
                    </button>
            </form>
            <button onClick={handleRegister} className="register-button">Register
            </button>
        </div>
    );
};

export default Login;