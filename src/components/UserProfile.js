import React from 'react';
import { Box, Typography } from '@mui/material';
import './UserProfile.css';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import PhoneIcon from '@mui/icons-material/Phone';

const UserProfile = ({ userDetails }) => {
  return (
    <Box className="profile-container">
      <Typography variant="h4" component="h1" className="profile-header">
        User Profile
      </Typography>

      <Box className="profile-detail">
        <PersonIcon className="profile-icon" />
        <Typography variant="h6" component="h2">
          <span className="profile-label">First Name:</span>
          <span className="profile-value">{userDetails.firstName}</span>
        </Typography>
      </Box>

      <Box className="profile-detail">
        <PersonIcon className="profile-icon" />
        <Typography variant="h6" component="h2">
          <span className="profile-label">Last Name:</span>
          <span className="profile-value">{userDetails.lastName}</span>
        </Typography>
      </Box>

      <Box className="profile-detail">
        <EmailIcon className="profile-icon" />
        <Typography variant="h6" component="h2">
          <span className="profile-label">Email:</span>
          <span className="profile-value">{userDetails.email}</span>
        </Typography>
      </Box>

      <Box className="profile-detail">
        <WorkIcon className="profile-icon" />
        <Typography variant="h6" component="h2">
          <span className="profile-label">Position:</span>
          <span className="profile-value">{userDetails.position}</span>
        </Typography>
      </Box>

      <Box className="profile-detail">
        <PhoneIcon className="profile-icon" />
        <Typography variant="h6" component="h2">
          <span className="profile-label">Phone Number:</span>
          <span className="profile-value">{userDetails.phoneNumber}</span>
        </Typography>
      </Box>
    </Box>
  );
};

export default UserProfile;
