import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import NewSignUp from './components/NewSignUp';
import NewLogin from './components/NewLogin';
import Home from './components/Home';
import UserProfile from './components/UserProfile';
import EditUserForm from './components/EditUserForm';
import { CssBaseline, AppBar, Toolbar, Typography, Button, Box, Dialog, DialogContent, IconButton, Drawer } from '@mui/material';
import { Link } from 'react-router-dom';
import Stocks from './components/Stocks';
import Orders from './components/Orders';
import Supplier from './components/Supplier';
import Sales from './components/Sales';
import NotificationAlerts from './components/NotificationAlerts';
import RawMaterialManager from './redux/RawMaterialManager';
import { loadAuth, logout } from './redux/reducers/authSlice';
import Products from './components/Products';
import Layout from './components/Layout';
import Inventory from './components/Inventory';
import Chatbot from './components/Chatbot';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import NewHome from './components/NewHome';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';  // Import AccountCircleIcon
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Tooltip from '@mui/material/Tooltip';  // Import Tooltip
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import axios from 'axios';
import ForgotPassword from './components/ForgotPassword';
import VerifyCode from './components/VerifyCode';
import ResetPassword from './components/ResetPassword';
import { Navigate } from 'react-router-dom';
import {   Fab } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';  // Import chat icon
import FloatingChatButton from './components/FloatingChatButton';
import DeliveredOrders from './components/DeliveredOrders';
import RequiredProductsStockAlerts from './components/RequiredProductsStockAlerts';

axios.defaults.baseURL=`http://98.82.11.0:8080`;

const App = () => {
  
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [authChecked, setAuthChecked] = useState(false);
  
  // Loading the auth state
  useEffect(() => {
    const loadAuthState = async () => {
      await dispatch(loadAuth());
      setAuthChecked(true);
    };
  
    loadAuthState();
  }, [dispatch]);
  


  const navigate = useNavigate();
  const location = useLocation();
  // Dialog state for notifications
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const handleNotificationClickOpen = () => {
    setNotificationDialogOpen(true);
  };

  const handleNotificationClose = () => {
    setNotificationDialogOpen(false);
  };

  const [stockAlerts, setStockAlerts] = useState([]);

  useEffect(() => {
    const fetchTopRawMaterials = async () => {
      try {
        const topRawMaterialsResponse = await axios.get('http://localhost:8080/api/sales/top-raw-materials');
        const topRawMaterials = topRawMaterialsResponse.data;

        const stockResponse = await axios.get('http://localhost:8080/api/rawMaterialStock');
        const allStocks = stockResponse.data;

        const alerts = topRawMaterials.reduce((acc, material) => {
          const stock = allStocks.find(stock =>
            stock.rawMaterial.materialName.toLowerCase() === material.rawMaterialName.toLowerCase()
          );

          if (stock && stock.quantity < stock.minQuantity) {
            acc.push(`Low stock alert: ${material.rawMaterialName} has ${stock.quantity} units, below minimum of ${stock.minQuantity} units.`);
          }

          return acc;
        }, []);

        setStockAlerts(alerts);
      } catch (error) {
        console.error('Error fetching raw material stock or top materials:', error);
      }
    };

    fetchTopRawMaterials();
  }, []);

  

  useEffect(() => {
    console.log("url changed");
    setDrawerOpen(false);
  }, [location]);

  const CustomDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
      position: 'absolute',
      top: '80px',  // Adjust based on the height of your AppBar
      right: '16px', // Adjust as needed to position towards the right
      margin: 0,
      width: '300px',  // Adjust width as needed
      borderRadius: '8px',
      boxShadow: theme.shadows[5],
    },
  }));

  // Theme toggle logic
  const [mode, setMode] = useState('light');
  const theme = createTheme({
    palette: {
      mode: mode,
    },
  });

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    dispatch(loadAuth());
  }, [dispatch]);

  // Dialog open state
  const [openDialog, setOpenDialog] = useState(false);


  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  }

  // Drawer open state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

    // State to control chatbot dialog open/close
    const [chatOpen, setChatOpen] = useState(false);

    const handleChatOpen = () => {
      setChatOpen(true);
    };
  
    const handleChatClose = () => {
      setChatOpen(false);
    };
  
    // Floating Action Button (Chatbot)
    <Fab
      color="primary"
      aria-label="chat"
      onClick={handleChatOpen}
      sx={{ position: 'fixed', bottom: 16, right: 16 }}  // Position FAB at bottom-right
    >
      <ChatIcon />
    </Fab>
  
    {/* Chatbot dialog */}
    <Dialog open={chatOpen} onClose={handleChatClose}>
      <DialogContent>
        <Chatbot userDetails={authState.userDetails} />
      </DialogContent>
    </Dialog>
  

  // Loading indicator while waiting for auth check
  if (!authChecked) {
    return <div>Loading...</div>;
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* App Bar Here */}
      <AppBar
        position="static"
        sx={{
          background: '#1e293b',  // Using the desired color
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)', // Softer shadow for depth
          padding: '8px 16px', // Ensure good spacing around content
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Hamburger Menu */}
            <Tooltip title={'Click to get more sections'}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{
                  marginRight: '16px',
                  color: '#fff',
                  // '&:hover': {
                  //   backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Enhanced hover effect
                  // },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <Typography
              color="inherit"
              component={Link}
              to="/"
              sx={{
                color: '#fff',
                fontWeight: 'bold',
                letterSpacing: '0.1em',
                fontSize: '1.5rem',
                textTransform: 'uppercase',
                textDecoration: 'none',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)', // Slight text shadow for emphasis
              }}
            >
              Automach
            </Typography>

          </Box>


          {/* Navigation and Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>


            {/* Theme Switcher */}
            <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              <Button
                color="inherit"
                onClick={toggleTheme}
                sx={{
                  color: '#fff',
                  fontWeight: '500',
                  padding: '10px 20px',
                  marginLeft: '8px',
                  borderRadius: '30px',
                  transition: 'background-color 0.4s ease',
                  // backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  // '&:hover': {
                  //   backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  color: theme.palette.text.primary,  // Use theme palette for text color
    backgroundColor: theme.palette.action.hover,  // Use dynamic hover color
    '&:hover': {
      backgroundColor: theme.palette.action.selected,  // Dynamic hover effect
                  },
                }}
              >
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </Button>
            </Tooltip>

            {/* Profile Icon */}
            {authState.isLoggedIn &&
              <Tooltip title="View Profile">
                <IconButton
                  color="inherit"
                  onClick={handleClickOpen}
                  sx={{
                    color: '#fff',
                    marginLeft: '16px',
                    padding: '10px',
                    borderRadius: '50%',
                    transition: 'background-color 0.4s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  <AccountCircleIcon />
                </IconButton>
              </Tooltip>
            }
            {authState.isLoggedIn &&
              <Tooltip title="View Notifications">
                <IconButton
                  color="inherit"
                  onClick={handleNotificationClickOpen}
                  sx={{
                    color: '#fff',
                    marginLeft: '16px',
                    padding: '10px',
                    borderRadius: '50%',
                    transition: 'background-color 0.4s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  <Badge badgeContent={stockAlerts.length} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            }



            {/* Drawer for Layout */}
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
              sx={{
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: 240,
                },
              }}
            >
              <Layout userDetails={authState.userDetails} />
            </Drawer>

            {/* Authentication Buttons */}
            {authState.isLoggedIn ? (
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  color: '#fff',
                  fontWeight: '500',
                  padding: '10px 20px',
                  marginLeft: '16px',
                  borderRadius: '30px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transition: 'background-color 0.4s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                Logout
              </Button>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  sx={{
                    color: '#fff',
                    fontWeight: '500',
                    marginRight: '16px',
                    padding: '10px 20px',
                    borderRadius: '30px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'background-color 0.4s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/signup"
                  sx={{
                    color: '#fff',
                    fontWeight: '500',
                    padding: '10px 20px',
                    borderRadius: '30px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'background-color 0.4s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>

      </AppBar>
      <Routes>
        {/* Routes */}
        <Route path="/" element={authState.isLoggedIn ? <NewHome userDetails={authState.userDetails} /> : <Navigate to="/login" />} />
        <Route path="profile" element={authState.isLoggedIn ? <UserProfile userDetails={authState.userDetails} /> : <Navigate to="/login" />} />
        <Route path="edit-profile" element={authState.isLoggedIn ? <EditUserForm userDetails={authState.userDetails} /> : <Navigate to="/login" />} />
        <Route path="stocks" element={authState.isLoggedIn ? <Stocks userDetails={authState.userDetails} /> : <Navigate to="/login" />} />
        <Route path="orders" element={authState.isLoggedIn ? <Orders userDetails={authState.userDetails} /> : <Navigate to="/login" />} />
        <Route path="sales" element={authState.isLoggedIn ? <Sales userDetails={authState.userDetails} /> : <Navigate to="/login" />} />
        <Route path="inventory" element={authState.isLoggedIn ? <Inventory userDetails={authState.userDetails} /> : <Navigate to="/login" />} />
        <Route path="supplier" element={authState.isLoggedIn ? <Supplier /> : <Navigate to="/login" />} />
        
        <Route path="delivered-orders" element={authState.isLoggedIn ? <DeliveredOrders userDetails={authState.userDetails} /> : <Navigate to="/login" />} />
        <Route path="products" element={authState.isLoggedIn ? <Products /> : <Navigate to="/login" />} />
        <Route path="/required-products-stock-alerts" element={<RequiredProductsStockAlerts />} />

        {/* Public routes */}
        <Route path="/login" element={<NewLogin />} />
        <Route path="/signup" element={<NewSignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>

      {/* User Profile Dialog */}

      <CustomDialog open={openDialog} onClose={handleClose}>
        <UserProfile userDetails={authState.userDetails} />
      </CustomDialog>
      <CustomDialog open={notificationDialogOpen} onClose={handleNotificationClose}>
        <NotificationAlerts alerts={stockAlerts} />
      </CustomDialog>

      {authState.isLoggedIn && (
      <FloatingChatButton userDetails={authState.userDetails} />
    )}


    </ThemeProvider>
    
  );
};

export default App;
