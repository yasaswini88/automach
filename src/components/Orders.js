import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
  FormControl,
  OutlinedInput,
  InputLabel,
  SelectChangeEvent,
  ListItemText,
  DialogContent, DialogActions, Autocomplete, Select, MenuItem, IconButton, Checkbox, FormControlLabel, TablePagination
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRawMaterials } from '../redux/reducers/rawMaterialSlice';
import { Edit, Delete } from '@mui/icons-material'; // Icons for edit and delete
import axios from 'axios';
import { formatDate } from '../utils/utilities';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';

import useMediaQuery from '@mui/material/useMediaQuery';



const Orders = ({ userDetails }) => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  

  const navigate = useNavigate();


  const [formErrors, setFormErrors] = useState({});


  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]); // New state for filtered orders
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false); // New state to manage edit mode
  const [suppliers, setSuppliers] = useState([]);

  const [filteredSuppliers, setFilteredSuppliers] = useState([]); // State for filtered suppliers
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // To control the delete confirmation dialog
  const [orderToDelete, setOrderToDelete] = useState(null); // To track which order is to be deleted

  //for sorting 
  // Add these states at the top of your component
  const [sortColumn, setSortColumn] = useState(null); // Track which column is sorted
  const [sortDirection, setSortDirection] = useState('asc'); // Track the sort direction ('asc' or 'desc')

  // New states for filters
  const [statusFilter, setStatusFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  

  const [newOrder, setNewOrder] = useState({
    orderId: '', // Added orderId to the state
    // supplierName: '',
    supplierId: '',
    status: 'Pending',
    // trackingInfo: '',
    notes: '',
    rawMaterialId: '',
    rawMaterialQuantity: 0,
    createdBy: '', // New field
    updatedBy: '', // New field
    createdDate: '', // New field
    updatedDate: '' // New field
  });


  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
};


  const dispatch = useDispatch();
  const rawMaterials = useSelector((state) => state.rawMaterials.rawMaterials);

  // state to track which columns are visible
  const [visibleColumns, setVisibleColumns] = useState({
    supplierName: true,
    status: true,
    // trackingInfo: true,
    notes: true,
    rawMaterialName: true,
    rawMaterialQuantity: true,
    createdBy: true,
    createdDate: true,
    updatedBy: true,
    updatedDate: true,
  });

  useEffect(() => {
    fetchOrders();
    dispatch(fetchRawMaterials());
    fetchSuppliers();
  }, [dispatch]);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('/api/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      const nonDeliveredOrders = response.data.filter(order => order.status !== 'Delivered');
      setOrders(nonDeliveredOrders);
      setFilteredOrders(nonDeliveredOrders); // Set filtered orders to non-delivered orders initially

      // Set filtered orders to fetched orders initially
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false); // Reset edit mode when closing dialog
    setNewOrder({
      orderId: '', // Reset orderId
      // supplierName: '',
      supplierName: suppliers.find(supplier => supplier.id === newOrder.supplierId)?.name || '', // Get supplier name by ID

      status: 'Pending',
      // trackingInfo: '',
      notes: '',
      rawMaterialId: '',
      rawMaterialQuantity: 0,
      createdBy: '', // Reset field
      updatedBy: '', // Reset field
      createdDate: '', // Reset field
      updatedDate: '' // Reset field
    });
  };

  //Handle Sort 
  const handleSort = (column) => {
    const isAsc = sortColumn === column && sortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);

    const sortedOrders = [...filteredOrders].sort((a, b) => {
      if (column === 'supplierName' || column === 'rawMaterialName') {
        // Sorting by strings (supplierName, rawMaterialName)
        return isAsc
          ? a[column].localeCompare(b[column])
          : b[column].localeCompare(a[column]);
      } else if (column === 'rawMaterialQuantity') {
        // Sorting by numbers (rawMaterialQuantity)
        return isAsc ? a[column] - b[column] : b[column] - a[column];
      }
      else if (column === 'createdDate') {
        // Sorting by date (createdDate)
        const dateA = new Date(a[column]);
        const dateB = new Date(b[column]);
        return newDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0; // If no valid column is provided
    });

    setFilteredOrders(sortedOrders);
  };

  // Fetch suppliers based on selected raw material
  const handleRawMaterialChange = (event, newValue) => {
    setNewOrder({ ...newOrder, rawMaterialId: newValue ? newValue.id : '' });

    // Fetch suppliers that supply the selected raw material
    if (newValue) {
      axios.get(`/api/suppliers/by-raw-material/${newValue.id}`)
        .then(response => setFilteredSuppliers(response.data))
        .catch(error => console.error('Error fetching suppliers:', error));
    } else {
      setFilteredSuppliers([]);
    }
  };

  const handleAddOrder = async () => {
    let errors = {};

  // Validation for required fields
  if (!newOrder.rawMaterialId) errors.rawMaterialId = "Please select a raw material.";
  if (!newOrder.supplierId) errors.supplierId = "Please select a supplier.";
  if (!newOrder.notes) errors.notes = "Notes are required.";
  if (newOrder.rawMaterialQuantity <= 0) errors.rawMaterialQuantity = "Quantity must be greater than zero.";

  // If there are validation errors, set them and stop execution
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  setFormErrors({}); 
    try {
      
      const currentDate = new Date().toISOString();

      const orderData = {
        orderId: newOrder.orderId,
        supplierId: newOrder.supplierId,  // Include supplierId
        supplierName: newOrder.supplierName,
        status: newOrder.status,
        // trackingInfo: newOrder.trackingInfo,
        notes: newOrder.notes,
        rawMaterialId: newOrder.rawMaterialId,
        rawMaterialQuantity: newOrder.rawMaterialQuantity,
        createdBy: newOrder.createdBy || userDetails.userId,
        updatedBy: newOrder.updatedBy,
        createdDate: editMode ? newOrder.createdDate : currentDate,
        updatedDate: currentDate
      };

      const response = editMode
        ? await axios.put(`/api/orders/${newOrder.orderId}`, orderData)
        : await axios.post('/api/orders', orderData);

      if (editMode) {
        setOrders(orders.map((order) => (order.orderId === response.data.orderId ? response.data : order)));
        setSnackbar({ open: true, message: 'Order updated successfully!', severity: 'success' });
      } else {
        setOrders([...orders, response.data]);
        setSnackbar({ open: true, message: 'Order added successfully!', severity: 'success' });
      }

      // filterOrders(statusFilter, materialFilter);
      fetchOrders(); // Refetch orders to exclude delivered ones

      handleClose();

      // Notify user that stock was updated if the status is 'Delivered'
      if (newOrder.status === 'Delivered') {
        setSnackbar({ open: true, message: 'Order delivered and stock updated successfully.', severity: 'info' });
      }

    } catch (error) {
      setSnackbar({ open: true, message: `Failed to ${editMode ? 'update' : 'add'} order. Please try again.`, severity: 'error' });
      console.error(`Error ${editMode ? 'updating' : 'adding'} order:`, error);
  }
  };

  const handleEditOrder = (order) => {
    setEditMode(true);
    setNewOrder({
      orderId: order.orderId,
      supplierName: order.supplierName,
      status: order.status,
      // trackingInfo: order.trackingInfo,
      notes: order.notes,
      rawMaterialId: order.rawMaterialId,
      rawMaterialQuantity: order.rawMaterialQuantity,
      createdBy: order.createdBy, // Preserve createdBy
      updatedBy: userDetails.userId, // Reset updatedBy for new entry
      createdDate: order.createdDate, // Preserve createdDate
      updatedDate: '' // Reset updatedDate for new entry
    });
    setOpen(true);
  };


  const handleDeleteOrder = (orderId) => {
    setOrderToDelete(orderId); // Set the orderId to be deleted
    setDeleteDialogOpen(true); // Open the confirmation dialog
  };

 
const confirmDeleteOrder = async () => {
  try {
      await axios.delete(`/api/orders/${orderToDelete}`);
      setOrders(orders.filter((order) => order.orderId !== orderToDelete));
      filterOrders(statusFilter, materialFilter); // Filter orders after deletion
      setSnackbar({ open: true, message: 'Order deleted successfully!', severity: 'success' });
      setDeleteDialogOpen(false); // Close the confirmation dialog
  } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete order. Please try again.', severity: 'error' });
      console.error('Error deleting order:', error);
  }
};

  const filterOrders = (status, material) => {
    let filtered = orders;
    if (status) {
      filtered = filtered.filter((order) => order.status === status);
    }
    if (material) {
      filtered = filtered.filter((order) => order.rawMaterialName === material);
    }
    setFilteredOrders(filtered);
  };

  useEffect(() => {
    filterOrders(statusFilter, materialFilter);
  }, [statusFilter, materialFilter, orders]);

  const handleColumnVisibilityChange = (column) => {
    console.log(column);
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  const [selectedOptions, setSelectedOptions] = useState([]);

  // Styling adjustments for light and dark modes
  const tableRowStyles = {
    backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#f0f0f0',
    borderBottom: `1px solid ${theme.palette.divider}`,
  };

  // fetch the users and map them 
  const [users, setUsers] = useState([]); // Store user data

  useEffect(() => {
    fetchUsers();
    fetchOrders();
    dispatch(fetchRawMaterials());
    fetchSuppliers();
  }, [dispatch]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data); // Store users data in state
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getUserNameById = (userId) => {
    const user = users.find((user) => user.userId === userId);
    return user ? `${user.firstName} ${user.lastName}` : '-';
  };



  return (

    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Supplier Orders
      </Typography>

      {/* Filter Inputs */}
      <Box display="flex" gap={2} mb={3} alignItems="center" justifyContent="space-between">
        {/* Left Side: Select and Autocomplete */}
        <Box display="flex" gap={2}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            variant="outlined"
            sx={{
              color: theme.palette.text.primary, // Adjust text color for dark mode
              backgroundColor: theme.palette.background.paper,
              width: '240px', // Set custom width
              height: '50px' // Set custom height
            }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Shipped">Shipped</MenuItem>
          </Select>

          {!isMobile && (
      <Autocomplete
        options={rawMaterials}
        getOptionLabel={(option) => option.materialName}
        value={rawMaterials.find(material => material.id === newOrder.rawMaterialId) || null}
        onChange={(event, newValue) => {
          setNewOrder({ ...newOrder, rawMaterialId: newValue ? newValue.id : '' });
          setMaterialFilter(newValue ? newValue.materialName : ''); // Update filter as well
        }}
        renderInput={(params) => (
          <TextField {...params} label="Filter by Raw Material" variant="outlined" sx={{ width: '240px', height: '50px' 
            
          }} />
        )}
      />
    )}
        </Box>

        {/* Right Side: View Delivered Orders Button */}
        {!isMobile && (
    <Button
      variant="outlined"
      color="secondary"
      onClick={() => navigate('/delivered-orders')}
      size="large"
      sx={{ width: '240px', height: '50px' }} // Custom width and height
    >
      View Delivered Orders
    </Button>
  )}
      </Box>



      {/* Column Visibility Control */}
      <Box display={isMobile ? 'none' : 'flex'} gap={2} mb={2}>
  {Object.keys(visibleColumns).map((column) => (
    <FormControlLabel
      key={column}
      control={
        <Checkbox
          checked={visibleColumns[column]}
          onChange={() => handleColumnVisibilityChange(column)}
        />
      }
      label={column.charAt(0).toUpperCase() + column.slice(1)} 
    />
  ))}
</Box>
      <Button variant="outlined" color="secondary" onClick={handleOpen}>
        Add Order
      </Button>

      <TableContainer component={Paper} sx={{ mt: 3, border: '1px solid grey' }}>
        <Table sx={{ border: '1px solid grey' }}>
          <TableHead>
            <TableRow style={tableRowStyles}>
              {/* {visibleColumns.supplierName && <TableCell>Supplier Name</TableCell>} */}
              {visibleColumns.supplierName && (
                <TableCell onClick={() => handleSort('supplierName')} style={{ cursor: 'pointer', color: theme.palette.text.primary }}>
                  Supplier Name {sortColumn === 'supplierName' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </TableCell>
              )}
              {visibleColumns.status && <TableCell>Status</TableCell>}
              {/* {visibleColumns.trackingInfo && <TableCell>Tracking Info</TableCell>} */}
              {visibleColumns.notes && !isMobile &&<TableCell>Notes</TableCell>}
              {visibleColumns.rawMaterialName && (
                <TableCell onClick={() => handleSort('rawMaterialName')} style={{ cursor: 'pointer' }}>
                  Raw Material {sortColumn === 'rawMaterialName' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </TableCell>
              )}
              {visibleColumns.rawMaterialQuantity && <TableCell>Quantity</TableCell>}
              {visibleColumns.createdBy && !isMobile &&<TableCell>Created By</TableCell>}
              {visibleColumns.createdDate && !isMobile && (
      <TableCell onClick={() => handleSort('createdDate')} style={{ cursor: 'pointer' }}>
        Created Date {sortColumn === 'createdDate' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
      </TableCell>
    )}
              {visibleColumns.updatedBy && !isMobile &&<TableCell>Updated By</TableCell>}
              {visibleColumns.updatedDate && !isMobile &&<TableCell>Updated Date</TableCell>}
              <TableCell>Actions</TableCell> {/* Actions column always visible */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => (
                <TableRow key={order.orderId}>
                  {visibleColumns.supplierName && <TableCell>{order.supplierName}</TableCell>}
                  {visibleColumns.status && <TableCell>{order.status}</TableCell>}
                  {/* {visibleColumns.trackingInfo && <TableCell>{order.trackingInfo}</TableCell>} */}
                  {visibleColumns.notes && !isMobile && <TableCell>{order.notes}</TableCell>}
                  {visibleColumns.rawMaterialName && <TableCell>{order.rawMaterialName}</TableCell>}
                  {visibleColumns.rawMaterialQuantity && <TableCell>{order.rawMaterialQuantity}</TableCell>}
                  {visibleColumns.createdBy && !isMobile && (
                    <TableCell>{getUserNameById(order.createdBy)}</TableCell> // Replace user ID with name
                  )}
                  {visibleColumns.createdDate && !isMobile && <TableCell>{formatDate(order.createdDate)}</TableCell>}
                  {visibleColumns.updatedBy && !isMobile &&(
                    <TableCell>{getUserNameById(order.updatedBy)}</TableCell> // Replace user ID with name
                  )}
       {visibleColumns.updatedDate && !isMobile && (
  <TableCell>{order.updatedDate ? formatDate(order.updatedDate) : formatDate(order.createdDate)}</TableCell>
)}

                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEditOrder(order)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteOrder(order.orderId)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
          <TablePagination
            component="div"
            count={filteredOrders.length} // Total number of rows
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0); // Reset to the first page
            }}
            rowsPerPageOptions={[5, 10, 25]} // Allow selection of rows per page
          />
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth={isMobile} maxWidth="sm">
        <DialogTitle style={tableRowStyles}>{editMode ? 'Edit Order' : 'Add New Order'}</DialogTitle>
        <DialogContent>
          {/* Autocomplete for raw material */}
          <Autocomplete
            options={rawMaterials}
            getOptionLabel={(option) => option.materialName}
            value={rawMaterials.find(material => material.id === newOrder.rawMaterialId) || null}
            onChange={handleRawMaterialChange}
            renderInput={(params) => (
              <TextField {...params} label="Select Raw Material" variant="outlined" 
              required

              error={!!formErrors.rawMaterialId}
      helperText={formErrors.rawMaterialId}/>
            )}
            fullWidth
            sx={{ mt: 2 }}
          />
        
          <Autocomplete
            options={filteredSuppliers}
            getOptionLabel={(option) => option.name}
            value={filteredSuppliers.find(supplier => supplier.id === newOrder.supplierId) || null}
            onChange={(event, newValue) => {
              setNewOrder({
                ...newOrder,
                supplierId: newValue ? newValue.id : '',  
                supplierName: newValue ? newValue.name : '' 
              });
            }}
            renderInput={(params) => (
              <TextField {...params} label="Select Supplier" variant="outlined" required
              error={!!formErrors.supplierId}
      helperText={formErrors.supplierId} />
            )}
            fullWidth
          />




          <Select
            fullWidth
            value={newOrder.status}
            onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Shipped">Shipped</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
          </Select>
          {/* <TextField
            margin="normal"
            label="Tracking Info"
            fullWidth
            variant="outlined"
            value={newOrder.trackingInfo}
            onChange={(e) => setNewOrder({ ...newOrder, trackingInfo: e.target.value })}
          /> */}
          <TextField
            required
            label="Notes"
            fullWidth
            variant="outlined"
            value={newOrder.notes}
            onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
            margin={isMobile ? 'dense' : 'normal'}
            sx={{ mt: isMobile ? 1 : 2 }}
          />
         
          <TextField
            required
            label="Raw Material Quantity"
            type="number"
            fullWidth
            
            error={!!formErrors.rawMaterialQuantity}
            helperText={formErrors.rawMaterialQuantity}
            variant="outlined"
            value={newOrder.rawMaterialQuantity}
            onChange={(e) => setNewOrder({ ...newOrder, rawMaterialQuantity: e.target.value })}
            
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddOrder} color="primary">
            {editMode ? 'Update Order' : 'Add Order'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this order?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteOrder} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
            </Alert>
        </Snackbar>

    </Box>
  );

};

export default Orders;
