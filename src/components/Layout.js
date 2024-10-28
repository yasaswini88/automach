import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import SellSharpIcon from '@mui/icons-material/SellSharp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import Typography from '@mui/material/Typography';
import NotificationsIcon from '@mui/icons-material/Notifications';

const drawerWidth = 240;


const Layout = ({ userDetails }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#1e293b', // Dark blue background for drawer
            color: '#fff', // White text for drawer items
          },
        }}
        variant="permanent"
        anchor="left"
      >
         <Typography variant="h6" sx={{ mb: 4, mt: 4 }}>
                Welcome, {userDetails?.firstName} {userDetails?.lastName}
            </Typography>
        <List>
          {/* Sales */}
          <ListItem
            button
            component={Link}
            to="/sales"
            sx={{
              '&:hover': {
                backgroundColor: '#0f172a', // Darker blue on hover
              },
            }}
          >
            <ListItemIcon sx={{ color: '#4ade80' /* Green color for icon */ }}>
              <SellSharpIcon />
            </ListItemIcon>
            <ListItemText primary="Sales" />
          </ListItem>

          {/* Orders */}
          <ListItem
            button
            component={Link}
            to="/orders"
            sx={{
              '&:hover': {
                backgroundColor: '#0f172a', // Darker blue on hover
              },
            }}
          >
            <ListItemIcon sx={{ color: '#f59e0b' /* Orange color for icon */ }}>
              <ShoppingCartIcon />
            </ListItemIcon>
            <ListItemText primary="Orders" />
          </ListItem>

          {/* Stock */}
          <ListItem
            button
            component={Link}
            to="/stocks"
            sx={{
              '&:hover': {
                backgroundColor: '#0f172a', // Darker blue on hover
              },
            }}
          >
            <ListItemIcon sx={{ color: '#60a5fa' /* Light blue for icon */ }}>
              <InventoryIcon />
            </ListItemIcon>
            <ListItemText primary="Stock" />
          </ListItem>
          

          {/* Suppliers */}
          <ListItem
            button
            component={Link}
            to="/supplier"
            sx={{
              '&:hover': {
                backgroundColor: '#0f172a', // Darker blue on hover
              },
            }}
          >
            <ListItemIcon sx={{ color: '#f87171' /* Red color for icon */ }}>
              <LocalShippingIcon />
            </ListItemIcon>
            <ListItemText primary="Suppliers" />
          </ListItem>

          {/* Products */}
          <ListItem
            button
            component={Link}
            to="/products"
            sx={{
              '&:hover': {
                backgroundColor: '#0f172a', // Darker blue on hover
              },
            }}
          >
            <ListItemIcon sx={{ color: '#38bdf8' /* Cyan color for icon */ }}>
              <ProductionQuantityLimitsIcon  />
            </ListItemIcon>
            <ListItemText primary="Products" />
          </ListItem>

          
          <ListItem
            button
            component={Link}
            to="/inventory"
            sx={{
              '&:hover': {
                backgroundColor: '#0f172a', // Darker blue on hover
              },
            }}
          >
            <ListItemIcon sx={{ color: '#10b981' /* Green color for icon */ }}>
              <InventoryOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Inventory" />
          </ListItem>
          

          {/* Chatbot */}
         
            
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        {/* Page content goes here */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
