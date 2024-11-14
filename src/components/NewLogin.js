import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import { loginSuccess, loadAuth } from "../redux/reducers/authSlice";
import "./Login.css";

const NewLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [keepMeSignedIn, setKeepMeSignedIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(loadAuth());
        if (authState.isLoggedIn) {
            navigate("/");
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

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        try {
            const response = await axios.post('/api/login', { email: username, password });
    
            if (response.status === 200) {
                const userDetails = response.data;
                dispatch(loginSuccess({ userDetails, keepMeSignedIn }));
                setMessage("Successfully Logged in 😀");
                setOpen(true);
                navigate("/");
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
        navigate("/forgot-password");
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="form-container">
                    <div className="login-content">
                        <div className="header">
                            <h1>Welcome Back <span>👋</span></h1>
                            <p className="subtitle">Let's explore the app again with us.</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <TextField
                                    fullWidth
                                    type="text"
                                    name="username"
                                    value={username}
                                    onChange={handleChange}
                                    variant="outlined"
                                    placeholder="Enter your username"
                                    className="form-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <TextField
                                    fullWidth
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={password}
                                    onChange={handleChange}
                                    variant="outlined"
                                    placeholder="Enter your password"
                                    className="form-input"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="keepMeSignedIn"
                                        checked={keepMeSignedIn}
                                        onChange={handleCheckboxChange}
                                        className="checkbox-input"
                                    />
                                    <span>Keep Me Signed In</span>
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

                            <Button
                                type="button"
                                onClick={handleForgotPassword}
                                color="secondary"
                                className="forgot-password-button"
                            >
                                Forgot Password?
                            </Button>
                        </form>

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
                    {/* You can add an illustration or image here */}
                </div>
            </div>
        </div>
    );
};

export default NewLogin;
