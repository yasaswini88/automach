import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Box, Button, TextField, Typography, Alert, Grid } from "@mui/material";


const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [passwordValid, setPasswordValid] = useState({
    length: false,
    specialChar: false,
    uppercase: false,
  });
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
  
    const email = location.state?.email;  // Ensure email is passed correctly
    if (!email) {
      setMessage("Error: Email not found.");
      return;
    }
  
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
  
    // Check password requirements
    if (!passwordValid.length || !passwordValid.specialChar || !passwordValid.uppercase) {
      setMessage("Password does not meet all requirements.");
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:8080/api/reset-password', {
        email,
        newPassword,
        confirmPassword,  // Send confirmPassword as well
      });
  
      setMessage(response.data.message);  // Handle message from the backend
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
                type="password"
                variant="outlined"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
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
                    backgroundColor: "#5848d9", // Optionally, a slightly darker color on hover
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
