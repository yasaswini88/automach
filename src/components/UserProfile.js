import React from 'react';
import { Box, Typography } from '@mui/material';
import './UserProfile.css';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import PhoneIcon from '@mui/icons-material/Phone';
import Avatar from '@mui/material/Avatar';

const UserProfile = ({ userDetails }) => {
  return (
    <Box className="profile-container" >
      <Avatar 
        src={userDetails.gender === 'male' 
          ? 'https://icons.veryicon.com/png/o/miscellaneous/user-avatar/user-avatar-male-5.png' 
          : 'https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/11_avatar-512.png'}
        alt="User Avatar"
        sx={{ 
          width: 100, 
          height: 100, 
          margin: '0 auto', 
          marginBottom: 2 
        }}
      />

      {/* Full Name */}
      <Box className="profile-detail">
        <PersonIcon className="profile-icon" />
        <Typography variant="h6" component="h2" className="profile-value">
          {userDetails.firstName} {userDetails.lastName}
        </Typography>
      </Box>

      {/* Email */}
      <Box className="profile-detail" 
      sx={{ whiteSpace: 'normal', overflow: 'visible' }}>
        <EmailIcon className="profile-icon" />
        <Typography variant="h6" component="h2" className="profile-value">
          {userDetails.email}
        </Typography>
      </Box>

      {/* Position */}
      <Box className="profile-detail">
        <WorkIcon className="profile-icon" />
        <Typography variant="h6" component="h2" className="profile-value">
          {userDetails.position}
        </Typography>
      </Box>

      {/* Phone Number */}
      <Box className="profile-detail">
        <PhoneIcon className="profile-icon" />
        <Typography variant="h6" component="h2" className="profile-value">
          {userDetails.phoneNumber}
        </Typography>
      </Box>
    </Box>
  );
};

export default UserProfile;
