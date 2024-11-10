import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Box, Button, TextField, Typography, Alert, Grid, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [passwordValid, setPasswordValid] = useState({
    length: false,
    specialChar: false,
    uppercase: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const validatePassword = (password) => {
    const lengthValid = password.length >= 8;
    const specialCharValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const uppercaseValid = /[A-Z]/.test(password);
    setPasswordValid({
      length: lengthValid,
      specialChar: specialCharValid,
      uppercase: uppercaseValid,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = location.state?.email;
    if (!email) {
      setMessage("Error: Email not found.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (!passwordValid.length || !passwordValid.specialChar || !passwordValid.uppercase) {
      setMessage("Password does not meet all requirements.");
      return;
    }
    try {
      const response = await axios.post('/api/reset-password', {
        email,
        newPassword,
        confirmPassword,
      });
      setMessage(response.data.message);
      if (response.status === 200) {
        navigate("/login");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.message || "Error resetting password.");
      } else {
        setMessage("Error resetting password. Please try again.");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#e8dede"
    >
      <Box
        sx={{
          backgroundColor: 'white',
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Typography variant="h5" mb={2}>
          Create new password
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography
                  variant="body2"
                  color={passwordValid.length ? "green" : "red"}
                >
                  Must be at least 8 characters.
                </Typography>
                <Typography
                  variant="body2"
                  color={passwordValid.specialChar ? "green" : "red"}
                >
                  Must contain at least 1 special character.
                </Typography>
                <Typography
                  variant="body2"
                  color={passwordValid.uppercase ? "green" : "red"}
                >
                  Must contain at least 1 uppercase letter.
                </Typography>
                <Typography
                  variant="body2"
                  color={newPassword === confirmPassword ? "green" : "red"}
                >
                  Both passwords must match.
                </Typography>
              </Box>
            </Grid>

            {message && (
              <Grid item xs={12}>
                <Alert severity={message === "Password reset successfully." ? "success" : "error"}>
                  {message}
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: "#6c63ff",
                  '&:hover': {
                    backgroundColor: "#5848d9",
                  }
                }}
              >
                Reset Password
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default ResetPassword;
