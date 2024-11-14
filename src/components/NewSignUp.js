import React, { useState } from "react";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";
import axios from "axios";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Typography } from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';
import { useNavigate } from "react-router-dom";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const NewSignUp = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const genders = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  const positions = [
    { label: "Supervisor", value: "supervisor" },
    { label: "Inventory manager", value: "Inventory manager" },
    { label: "Quality Assurance Manager", value: "Quality Assurance Manager" },
  ];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    position: "",
    dateOfBirth: dayjs(),
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState({
    length: false,
    specialChar: false,
    uppercase: false,
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEmailBlur = async () => {
    if (!formData.email) return;

    try {
      const response = await axios.get("/api/users");
      const existingUser = response.data.find(user => user.email === formData.email);

      if (existingUser) {
        setEmailError("User with this email already exists.");
      } else {
        setEmailError('');
      }
    } catch (error) {
      console.error("Error checking email:", error);
      setEmailError("Unable to verify email. Please try again later.");
    }
  };

  const validatePassword = (password) => {
    setPasswordValid({
      length: password.length >= 8,
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      uppercase: /[A-Z]/.test(password),
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName) errors.firstName = "First name is required.";
    if (!formData.lastName) errors.lastName = "Last name is required.";
    if (!formData.gender) errors.gender = "Gender is required.";
    if (!formData.position) errors.position = "Position is required.";
    if (!formData.dateOfBirth || !dayjs(formData.dateOfBirth).isValid()) {
      errors.dateOfBirth = "Valid date of birth is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Email is not valid.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    const phoneRegex = /^\d{10}$/;
    if (!formData.phoneNumber) {
      errors.phoneNumber = "Phone number is required.";
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone number must be 10 digits.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === "password") {
      validatePassword(value);
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      dateOfBirth: date,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (emailError) return;
    if (!validateForm()) return;

    try {
      const response = await axios.post('/api/users', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        position: formData.position,
        dateOfBirth: formData.dateOfBirth.format('YYYY-MM-DD'),
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: formData.phoneNumber
      });
      console.log('User successfully signed up:', response.data);
      setSnackbar({ open: true, message: 'Signup successful!', severity: 'success' });
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('There was an error submitting the form:', error);
      setSnackbar({ open: true, message: 'Signup failed. Please try again.', severity: 'error' });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="signup-container" style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#e8dede",
      padding: isMobile ? "20px 10px" : "20px"
    }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 900,
          padding: isMobile ? 2 : 3,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <Grid container spacing={isMobile ? 2 : 0}>
          <Grid item xs={12} md={6}>
            <h2 style={{ textAlign: 'center', margin: isMobile ? '10px 0' : '20px 0' }}><strong>Sign Up</strong></h2>
            <form onSubmit={handleSubmit}>
              <Box sx={{ 
                '& > :not(style)': { 
                  m: isMobile ? 0.5 : 1, 
                  width: '100%' 
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: isMobile ? 1 : 2
              }} noValidate autoComplete="off">
                <TextField
                  label="First Name"
                  variant="filled"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  sx={{ width: '85%' }}
                  fullWidth={isMobile}
                />
                <TextField
                  label="Last Name"
                  variant="filled"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                  sx={{ width: '85%' }}
                  fullWidth={isMobile}
                />
                <TextField
                  select
                  label="Gender"
                  variant="filled"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  error={!!formErrors.gender}
                  helperText={formErrors.gender}
                  sx={{ width: '85%' }}
                  fullWidth={isMobile}
                >
                  {genders.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Position"
                  variant="filled"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  error={!!formErrors.position}
                  helperText={formErrors.position}
                  sx={{ width: '85%' }}
                  fullWidth={isMobile}
                >
                  {positions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DatePicker"]}>
                    <DatePicker
                      label="Date of Birth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleDateChange}
                      slotProps={{ 
                        textField: { 
                          variant: "filled",
                          fullWidth: isMobile 
                        } 
                      }}
                      error={!!formErrors.dateOfBirth}
                      helperText={formErrors.dateOfBirth}
                      sx={{ width: '85%' }}
                    />
                  </DemoContainer>
                </LocalizationProvider>

                <TextField
                  label="example@gmail.com"
                  variant="filled"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  required
                  error={!!emailError}
                  helperText={emailError || formErrors.email}
                  fullWidth={isMobile}
                  sx={{ width: '85%' }}
                />
                <TextField
                  label="Password"
                  variant="filled"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  fullWidth={isMobile}
                  sx={{ width: '85%' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={togglePasswordVisibility} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  label="Confirm Password"
                  variant="filled"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                  fullWidth={isMobile}
                  sx={{ width: '85%' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={togglePasswordVisibility} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Box sx={{ width: '85%', mt: 1 }}>
                  <Typography variant="body2" color={passwordValid.length ? "green" : "red"}>Must be at least 8 characters.</Typography>
                  <Typography variant="body2" color={passwordValid.specialChar ? "green" : "red"}>Must contain at least 1 special character.</Typography>
                  <Typography variant="body2" color={passwordValid.uppercase ? "green" : "red"}>Must contain at least 1 uppercase letter.</Typography>
                </Box>

                <TextField
                  label="Phone Number"
                  variant="filled"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  error={!!formErrors.phoneNumber}
                  helperText={formErrors.phoneNumber}
                  fullWidth={isMobile}
                  sx={{ width: '85%' }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2, width: '100%' }}>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    type="submit"
                    sx={{ width: isMobile ? '100%' : 'auto' }}
                  >
                    Submit
                  </Button>
                </Box>
              </Box>
            </form>
          </Grid>

          {!isMobile && (
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://img.freepik.com/free-photo/picture-frame-by-velvet-armchair_53876-132788.jpg"
                alt="Signup illustration"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            </Grid>
          )}
        </Grid>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ 
            width: isMobile ? '90%' : '80%', 
            maxWidth: '700px' 
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default NewSignUp;
