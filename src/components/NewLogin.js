import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import axios from 'axios';
import { loginSuccess, loadAuth } from "../redux/reducers/authSlice";
import "./Login.css";

const NewLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [keepMeSignedIn, setKeepMeSignedIn] = useState(false); // Added state for "Keep Me Signed In"
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(loadAuth()); // Load authentication state on mount
        if (authState.isLoggedIn) {
            navigate("/"); // Navigate if already logged in
        }
    }, [authState.isLoggedIn, dispatch, navigate]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === "username") {
            setUsername(value);
        } else if (name === "password") {
            setPassword(value);
        }
    };

    const handleCheckboxChange = (e) => {
        setKeepMeSignedIn(e.target.checked);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        try {
            const response = await axios.post('http://localhost:8080/api/login', { email: username, password });
    
            if (response.status === 200) {
                const userDetails = response.data;

                // Dispatch Redux action with the userDetails and keepMeSignedIn flag
                dispatch(loginSuccess({ userDetails, keepMeSignedIn }));

                setMessage("Successfully Logged in 😀");
                setOpen(true);
                navigate("/");  // Navigate after successful login
            } else {
                setMessage("Login Failed !!! 😡");
                setOpen(true);
            }
        } catch (error) {
            setMessage("Login Failed !!! 😡");
            setOpen(true);
        }
    };

    const handleRegister = () => {
        navigate("/signup");
    };

    const handleForgotPassword = () => {
        navigate("/forgot-password"); // Navigate to ForgotPassword page
    };
    

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div className="login-container">
        <div className="form-container">
            <div>
            <div className="header">
                <h2>Welcome Back <span>👋</span></h2>
                <p>Let’s explore the app again with us.</p>
            </div>
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
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className="login-button"
                >
                    Login
                </Button>
                <br />
                <Button
                    type="button"
                    onClick={handleForgotPassword}
                    color="secondary"
                    className="forgot-password-button"
                >
                    Forgot Password?
                </Button>
            </form>
            <Button
                onClick={handleRegister}
                color="primary"
                className="register-button"
            >
                Register
            </Button>

            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                message={message}
                action={
                    <Button color="inherit" size="small" onClick={handleClose}>
                        Close
                    </Button>
                }
            />
            </div>
        </div>
        <div className="image-container">

        </div>
    </div>
    );
};

export default NewLogin;
