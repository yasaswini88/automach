import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import NewSignUp from './components/NewSignUp';
import NewLogin from './components/NewLogin';
import Home from './components/Home';
import UserProfile from './components/UserProfile';
import EditUserForm from './components/EditUserForm';
import { CssBaseline, AppBar, Toolbar, Typography, Button, Box, Dialog, DialogContent, IconButton, Drawer, useMediaQuery } from '@mui/material';
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
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import NewHome from './components/NewHome';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import axios from 'axios';
import ForgotPassword from './components/ForgotPassword';
import VerifyCode from './components/VerifyCode';
import ResetPassword from './components/ResetPassword';
import { Navigate } from 'react-router-dom';
import { Fab } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import FloatingChatButton from './components/FloatingChatButton';
import DeliveredOrders from './components/DeliveredOrders';
import RequiredProductsStockAlerts from './components/RequiredProductsStockAlerts';
import Customers from './components/Customers';


 axios.defaults.baseURL=`http://98.82.11.0:8080`;
// axios.defaults.baseURL=`http://localhost:8080`;


console.log(process.env)

const App = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const loadAuthState = async () => {
      await dispatch(loadAuth());
      setAuthChecked(true);
    };

    loadAuthState();
  }, [dispatch]);

  const navigate = useNavigate();
  const location = useLocation();
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
        const topRawMaterialsResponse = await axios.get('/api/sales/top-raw-materials');
        const topRawMaterials = topRawMaterialsResponse.data;

        const stockResponse = await axios.get('/api/rawMaterialStock');
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
      top: isMobile ? '60px' : '80px',
      right: isMobile ? '8px' : '16px',
      margin: 0,
      width: isMobile ? '90%' : '300px',
      borderRadius: '8px',
      boxShadow: theme.shadows[5],
    },
  }));

  const [mode, setMode] = useState('light');
  const customTheme = createTheme({
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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const [chatOpen, setChatOpen] = useState(false);

  const handleChatOpen = () => {
    setChatOpen(true);
  };

  const handleChatClose = () => {
    setChatOpen(false);
  };



  if (!authChecked) {
    return <div>Loading...</div>;
  }
  
  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />

      <AppBar
        position="static"
        sx={{
          background: '#1e293b',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)',
          padding: isMobile ? '4px 8px' : '8px 16px',
        }}
      >
        <Toolbar sx={{ 
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          padding: isMobile ? '8px 0' : 'inherit'
        }}>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'space-between' : 'flex-start',
            marginBottom: isMobile ? '8px' : 0
          }}>
            {authState.isLoggedIn && (
              <Tooltip title={'Click to get more sections'}>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={toggleDrawer(true)}
                  sx={{
                    marginRight: isMobile ? '8px' : '16px',
                    color: '#fff',
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Tooltip>
            )}

            <Typography
              color="inherit"
              component={Link}
              to="/"
              sx={{
                color: '#fff',
                fontWeight: 'bold',
                letterSpacing: '0.1em',
                fontSize: isMobile ? '1.2rem' : '1.5rem',
                textTransform: 'uppercase',
                textDecoration: 'none',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              Automach
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
            flexWrap: isMobile ? 'wrap' : 'nowrap'
          }}>
            {authState.isLoggedIn && (
              <>
                <Tooltip title="View Profile">
                  <IconButton
                    color="inherit"
                    onClick={handleClickOpen}
                    sx={{
                      color: '#fff',
                      marginLeft: isMobile ? '0' : '16px',
                    }}
                  >
                    <AccountCircleIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="View Notifications">
                  <IconButton
                    color="inherit"
                    onClick={handleNotificationClickOpen}
                    sx={{
                      color: '#fff',
                      marginLeft: isMobile ? '0' : '16px',
                    }}
                  >
                    <Badge badgeContent={stockAlerts.length} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </>
            )}

            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
              sx={{
                '& .MuiDrawer-paper': {
                  width: isMobile ? '100%' : 240,
                },
              }}
            >
              <Layout userDetails={authState.userDetails} />
            </Drawer>

            {authState.isLoggedIn ? (
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  color: '#fff',
                  fontWeight: '500',
                  padding: isMobile ? '8px 16px' : '10px 20px',
                  marginLeft: isMobile ? '0' : '16px',
                  borderRadius: '30px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  width: isMobile ? '100%' : 'auto',
                  marginTop: isMobile ? '8px' : 0
                }}
              >
                Logout
              </Button>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                width: isMobile ? '100%' : 'auto',
                gap: isMobile ? '8px' : '0'
              }}>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  sx={{
                    color: '#fff',
                    fontWeight: '500',
                    padding: isMobile ? '8px 16px' : '10px 20px',
                    marginRight: isMobile ? '0' : '16px',
                    borderRadius: '30px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    width: isMobile ? '100%' : 'auto'
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
                    padding: isMobile ? '8px 16px' : '10px 20px',
                    borderRadius: '30px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={authState.isLoggedIn ? <NewHome userDetails={authState.userDetails} /> : <Navigate to="/login" />} />
        <Route path="profile" element={authState.isLoggedIn ? <UserProfile userDetails={authState.userDetails} /> : <Navigate to="/login" />} />
        <Route path="edit-profile" element={authState.isLoggedIn ? <EditUserForm userDetails={authState.userDetails} /> : <Navigate to="/login" />} />
        <Route path="stocks" element={authState.isLoggedIn ? <Stocks userDetails={authState.userDetails} /> : <Navigate to="/login" />} />
        <Route path="orders" element={authState.isLoggedIn ? <Orders userDetails={authState.userDetails} /> : <Navigate to="/login" />} />
        <Route path="sales" element={authState.isLoggedIn ? <Sales userDetails={authState.userDetails} /> : <Navigate to="/login" />} />
        <Route path="inventory" element={authState.isLoggedIn ? <Inventory userDetails={authState.userDetails} /> : <Navigate to="/login" />} />
        <Route path="supplier" element={authState.isLoggedIn ? <Supplier /> : <Navigate to="/login" />} />
        <Route path="customers" element={authState.isLoggedIn ? <Customers /> : <Navigate to="/login" />} />
        <Route path="delivered-orders" element={authState.isLoggedIn ? <DeliveredOrders userDetails={authState.userDetails} /> : <Navigate to="/login" />} />
        <Route path="products" element={authState.isLoggedIn ? <Products /> : <Navigate to="/login" />} />
        <Route path="/required-products-stock-alerts" element={<RequiredProductsStockAlerts />} />

        <Route path="/login" element={<NewLogin />} />
        <Route path="/signup" element={<NewSignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>

      <CustomDialog
        open={openDialog}
        onClose={handleClose}
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : '1000px',
            padding: isMobile ? 1 : 2,
            overflow: 'visible',
          },
        }}
      >
        <UserProfile userDetails={authState.userDetails} />
      </CustomDialog>

      <CustomDialog 
        open={notificationDialogOpen} 
        onClose={handleNotificationClose}
        fullScreen={isMobile}
      >
        <NotificationAlerts alerts={stockAlerts} />
      </CustomDialog>

      {authState.isLoggedIn && !isMobile && (
        <FloatingChatButton userDetails={authState.userDetails} />
      )}


    </ThemeProvider>
    
  );
};

export default App;
