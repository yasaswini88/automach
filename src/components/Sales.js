import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, Select, MenuItem, Box,
  DialogTitle, Button, TextField, useTheme, Chip, Grid, Autocomplete, InputLabel, FormControl, OutlinedInput, Typography, Link,
  FormHelperText
} from '@mui/material';
import { Edit, Delete, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import dayjs from "dayjs";
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import AddIcon from '@mui/icons-material/Add';
import { formatDate } from '../utils/utilities';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { TableSortLabel } from '@mui/material';
import { Snackbar, Alert } from '@mui/material';
import CustomersDialog from './CustomersDialog';
import useMediaQuery from '@mui/material/useMediaQuery';



const Sales = ({ userDetails }) => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [sales, setSales] = useState([]);
  const [orderStatus, setOrderStatus] = useState('');

  const [expandedRow, setExpandedRow] = useState(null);
  const [shippingOptions, setShippingOptions] = useState(['Pending', 'Shipped', 'Delivered']);

  //snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });


  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editSale, setEditSale] = useState(null);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [openAdd, setOpenAdd] = useState(false); // Separate state for Add dialog
  const [openEdit, setOpenEdit] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortedSales, setSortedSales] = useState([...sales]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('');  // Filter for order status
  const [orderDecisionFilter, setOrderDecisionFilter] = useState('');  // Filter for order decision

  // For Customer Names 
  const [customers, setCustomers] = useState([]);



  const [formErrors, setFormErrors] = useState({});


  // Separate state for Edit dialog
  const [formData, setFormData] = useState({
    customerName: '',
    orderDecision: '',
    productIds: [],
    quantities: [],
    discountPercent: '',
    orderStatus: '',
    orderDeliveryDate: ''
  });

  const [newSale, setNewSale] = useState({
    customerName: "",
    orderDecision: "",
    products: [{ prodId: '', quantity: '' }],
    // productIds: [],
    // quantities: "",
    discountPercent: "",
    orderStatus: "Pending",
    orderCreatedDate: new Date(),
    createdUserId: userDetails.userId,
    orderDeliveryDate: "",
  });

  // For New Customer Adding Dialog Box 

  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);

  const handleOpenCustomerDialog = () => {
    setIsCustomerDialogOpen(true);
  };

  const handleCloseCustomerDialog = () => {
    setIsCustomerDialogOpen(false);
  };


  

  const handleSaveCustomer = (customerData) => {
  axios.post('/api/customers', customerData)
    .then(() => {
      setSnackbar({ open: true, message: 'Customer added successfully!', severity: 'success' });
      fetchCustomers();
      handleCloseCustomerDialog();
    })
    .catch((error) => {
      console.error('Error adding customer:', error); // Log the exact error for debugging
      setSnackbar({ open: true, message: 'Error adding customer.', severity: 'error' });
    });
};


  //snack bar 

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  // Fetch sales data
  useEffect(() => {
    axios.get('/api/sales')
      .then(response => {
        setSales(response.data);
        setSortedSales(response.data);  // Initialize sortedSales
      })
      .catch(error => console.error('Error fetching sales:', error));
  }, []);


  useEffect(() => {
    axios.get('/api/inventory/')
      .then(response => setInventory(response.data))
      .catch(error => console.error('Error fetching sales:', error));
  }, []);

  useEffect(() => {
    axios.get('/api/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);



  const filteredSales = sortedSales
    .filter((sale) => !orderStatusFilter || sale.orderStatus.toLowerCase() === orderStatusFilter.toLowerCase())
    .filter((sale) => !orderDecisionFilter || sale.orderDecision.toLowerCase() === orderDecisionFilter.toLowerCase());

  //Fetching Customer Names 
  const fetchCustomers = () => {
    axios.get('/api/customers')
    .then(response => setCustomers(response.data))
    .catch(error => console.error('Error fetching customers:', error));
  };
  useEffect(() => {
    fetchCustomers();
  }, []);
  

  //for pagination , not navigating to next page

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= filteredSales.length) {
      setPage(0); // Reset page to 0 if filtered rows are fewer than the current page
    }
  }, [filteredSales.length, page, rowsPerPage]);


  const handleOrderStatusFilterChange = (event) => {
    setOrderStatusFilter(event.target.value);
  };

  const handleOrderDecisionFilterChange = (event) => {
    setOrderDecisionFilter(event.target.value);
  };


  const handleSort = (column) => {
    const isDesc = sortColumn === column && sortDirection === 'desc';
    const newDirection = isDesc ? 'asc' : 'desc';

    setSortColumn(column);
    setSortDirection(newDirection);

    const sorted = [...sales].sort((a, b) => {
      let aValue, bValue;

      if (column === 'customerName') {
        aValue = a.customerName.toLowerCase();
        bValue = b.customerName.toLowerCase();
      } else if (column === 'orderCreatedDate') {
        aValue = new Date(a.orderCreatedDate);
        bValue = new Date(b.orderCreatedDate);
      } else if (column === 'orderDeliveryDate') {
        aValue = new Date(a.orderDeliveryDate);
        bValue = new Date(b.orderDeliveryDate);
      } else {
        return 0;
      }

      return isDesc ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    setSortedSales(sorted);
  };



  const handleDelete = (id) => {
    setSaleToDelete(id);       // Set sale ID
    setOpenDeleteDialog(true); // Open confirmation dialog
  };

  

  // Confirm delete method
  const confirmDelete = () => {
    axios.delete(`/api/sales/${saleToDelete}`)
      .then(() => {
        setSales(sales.filter(sale => sale.saleId !== saleToDelete)); // Update sales list
        setSnackbar({ open: true, message: 'Order deleted successfully!', severity: 'success' });
        setOpenDeleteDialog(false);  // Close the dialog
        setSaleToDelete(null);  // Reset saleToDelete
      })
      .catch(error => {
        setSnackbar({ open: true, message: 'Error deleting order.', severity: 'error' });
      });
  };

 

  useEffect(() => {
    if (editSale) {
      axios.get(`/api/sales/${editSale?.saleId}/ready-to-ship`)
        .then(resp => {
          let options = [];
          switch (editSale.orderStatus.toLowerCase()) {
            case 'pending':
              options = resp.data ? ['Pending', 'Shipped', 'Delivered'] : ['Pending'];
              break;
            case 'shipped':
              options = ['Shipped', 'Delivered'];
              break;
            case 'delivered':
              options = ['Delivered'];
              break;
            default:
              options = ['Pending'];
          }
          setShippingOptions(options);
          setOpenEdit(true); 
        })
        .catch(error => {
          console.error('Error fetching ready-to-ship status:', error);
          // Set shipping options based on the current status
          let options = [];
          switch (editSale.orderStatus.toLowerCase()) {
            case 'shipped':
              options = ['Delivered'];
              break;
            case 'delivered':
              options = ['Delivered'];
              break;
            default:
              options = ['Pending'];
          }
          setShippingOptions(options);
          setOpenEdit(true);
        });
    }
  }, [editSale]);


  // Handle dialog open for editing
  const handleEdit = (sale) => {
    setEditSale(sale);
    setFormData({
      customerName: sale.customerName,
      orderDecision: sale.orderDecision,
      productIds: sale.products.map(prod => prod.prodId),
      // Ensure quantities is treated as an array
      quantities: Array.isArray(sale.quantities) ? sale.quantities : sale.quantities.split(',').map(Number),
      discountPercent: sale.discountPercent,
      orderStatus: sale.orderStatus,
      orderDeliveryDate: new Date(sale.orderDeliveryDate).toISOString().split('T')[0],
    });
  };



  const handleSave = () => {

    // Extract the old quantities and product IDs from the sale being edited
    const oldQuantities = editSale.quantities || [];
    const productIds = editSale.products.map(product => product.prodId);
    console.log(oldQuantities)
    console.log(productIds)

    // Check if `orderDecision` is changing from "Quoted" to "Confirmed"
    const orderDecisionChangedToConfirmed = editSale.orderDecision.toLowerCase() === 'quoted' && formData.orderDecision.toLowerCase() === 'confirmed';
    console.log(orderDecisionChangedToConfirmed)
    const updatedSale = {
      ...formData,
      updatedUserId: userDetails.userId,
      updatedDate: new Date().toISOString(),

      quantities: Array.isArray(formData.quantities) ? formData.quantities : formData.quantities.split(',').map(Number), // Ensure quantities is an array before saving
      oldQuantities: oldQuantities, // Add old quantities here
      // productIds: productIds // Add product IDs here if needed
      orderDecisionChangedToConfirmed: orderDecisionChangedToConfirmed,// Flag to indicate change
      orderStatus: formData.orderStatus.toLowerCase()
    };

    axios.put(`/api/sales/${editSale.saleId}`, updatedSale)
      .then(response => {
        setSales(sales.map(sale => (sale.saleId === editSale.saleId ? response.data : sale)));
        axios.get('/api/sales')
          .then(response => {
            setSales(response.data);
            setSortedSales(response.data);  // Initialize sortedSales
          })
          .catch(error => console.error('Error fetching sales:', error));
        // Refresh inventory to reflect updated blocked/required quantities
        axios.get('/api/inventory/')
          .then(inventoryResponse => {
            setInventory(inventoryResponse.data);
            setSnackbar({ open: true, message: 'Order updated successfully!', severity: 'success' });
          });
        setOpenEdit(false);
      })
      .catch(error => {
        setSnackbar({ open: true, message: 'Error updating order.', severity: 'error' });
      });
  };




  // Handle form input changes for editing
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === 'quantities'
        ? e.target.value.split(',').map(Number)  // Ensure quantities are split into an array
        : e.target.value
    });

    console.log(formData);
  };

  // Table Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open dialog for adding new order
  const handleClickOpenAdd = () => {
    setOpenAdd(true);
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
  };

  // Handle form changes for new order
  const handleInputChange = (e) => {
    setNewSale({
      ...newSale,
      [e.target.name]: e.target.value,
    });
  };

  const handleRemoveProduct = (index) => {
    const newProducts = newSale.products.filter((_, i) => i !== index);
    setNewSale({ ...newSale, products: newProducts });
  }

  const handleQuantityInput = (index, event) => {
    const { name, value } = event.target;
    const newProds = [...newSale.products];
    newProds[index].quantity = Number(value);
    setNewSale({ ...newSale, products: newProds });
  }

  const handleAddNewProduct = () => {
    setNewSale({ ...newSale, products: [...newSale.products, { prodId: '', quantity: '' }] });
  }



  const handleAddOrder = () => {

    const errors = {};

    if (!newSale.customerName) errors.customerName = 'Customer Name is required.';
    if (!newSale.orderDecision) errors.orderDecision = 'Order Decision is required.';
    if (!newSale.products.length || newSale.products.some((prod) => !prod.prodId)) errors.products = 'At least one product is required.';
    if (newSale.products.some((prod) => !prod.quantity || prod.quantity <= 0)) errors.quantities = 'Each product must have a valid quantity.';
    if (!newSale.discountPercent || isNaN(newSale.discountPercent)) {
      errors.discountPercent = 'Discount Percent must be a valid number.';
  }


  if (!newSale.orderDeliveryDate) {
      errors.orderDeliveryDate = 'Promised Delivery Date is required.';
  }


    if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setSnackbar({ open: true, message: 'Please fix errors before adding the order.', severity: 'error' });
        return;
    }

    setFormErrors({}); 

    const saleData = {
      customerName: newSale.customerName,
      orderDecision: newSale.orderDecision,
      productIds: newSale.products.map(p => p.prodId),
      quantities: newSale.products.map(p => p.quantity),
      // discountPercent: newSale.discountPercent,
      discountPercent: newSale.discountPercent ? Number(newSale.discountPercent) : 0,
      orderStatus: newSale.orderStatus,
      orderCreatedDate: newSale.orderCreatedDate,
      createdUserId: Number(newSale.createdUserId),
      orderDeliveryDate: newSale.orderDeliveryDate,
    };

    axios.post("/api/sales", saleData)
      .then(() => {
        axios.get('/api/sales')
          .then(response => {
            setSales(response.data);
            setSnackbar({ open: true, message: 'Order added successfully!', severity: 'success' });
            axios.get('/api/sales') // Fetch orders again
              .then(response => {
                setSales(response.data);
                setSortedSales(response.data); // Update sortedSales
              })
            handleCloseAdd();
          })
          .catch(error => {
            setSnackbar({ open: true, message: 'Error fetching updated sales.', severity: 'error' });
          });
      })
      .catch((error) => {
        setSnackbar({ open: true, message: 'Error adding new order.', severity: 'error' });
      });
  };

  // Handle status updates for delivered orders
  const handleStatusUpdate = (saleId, newStatus) => {
    axios.put(`/api/sales/${saleId}/status?status=${newStatus}`)
      .then(() => {
        // Refresh sales or update UI accordingly
      })
      .catch((error) => {
        console.error("Error updating sale status:", error);
      });
  };


  // Styling adjustments for light and dark modes
  const tableRowStyles = {
    backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#f0f0f0',
    borderBottom: `1px solid ${theme.palette.divider}`,
  };

  const handleExpandClick = (saleId) => {
    setExpandedRow(expandedRow === saleId ? null : saleId);
  };
  const [expandedDetails, setExpandedDetails] = useState({});

  const toggleDetails = (saleId) => {
    setExpandedDetails((prevState) => ({
      ...prevState,
      [saleId]: !prevState[saleId], // Toggle the visibility for the selected sale
    }));
  };


  return (
    <Paper>
      <h1 sx={{ ml: 3 }}>Sales Orders</h1>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ ml: 3, mt: 2 }}>
  {/* Add New Order Button */}
  <Button variant="outlined" color="secondary" onClick={handleClickOpenAdd}>
    Add New Order
  </Button>

  {/* Filters */}
  {!isMobile && (
    <Box display="flex" gap={2} alignItems="center">
      {/* Filter by Order Status */}
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel id="order-status-filter-label">Filter by Order Status</InputLabel>
        <Select
          labelId="order-status-filter-label"
          value={orderStatusFilter}
          onChange={handleOrderStatusFilterChange}
          label="Filter by Order Status"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Shipped">Shipped</MenuItem>
          <MenuItem value="Delivered">Delivered</MenuItem>
        </Select>
      </FormControl>

      {/* Filter by Order Decision */}
      <FormControl sx={{ minWidth: 200, mr: 3 }}> {/* Added margin-right to space it out */}
        <InputLabel id="order-decision-filter-label">Filter by Order Decision</InputLabel>
        <Select
          labelId="order-decision-filter-label"
          value={orderDecisionFilter}
          onChange={handleOrderDecisionFilterChange}
          label="Filter by Order Decision"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Quoted">Quoted</MenuItem>
          <MenuItem value="Confirmed">Confirmed</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )}
</Box>



      

      {/* Dialog for adding new order */}
      <Dialog open={openAdd} onClose={handleCloseAdd}>
        <DialogTitle>Add New Order</DialogTitle>
        <DialogContent>
         

          <Autocomplete
            options={customers}
            getOptionLabel={(option) => option.customerName}
            onChange={(event, newValue) => {
              setNewSale({ ...newSale, customerName: newValue ? newValue.customerName : '' });
            }}
            renderInput={(params) => (
              <TextField {...params} label="Customer Name" margin="dense" fullWidth 
              error={Boolean(formErrors.customerName)}
            helperText={formErrors.customerName}
            />
            )}
            sx={{ mb: 1 }}
          />


 
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>

            <Link
              component="button"
              variant="body2"
              onClick={handleOpenCustomerDialog}
              sx={{ cursor: 'pointer', color: 'primary.main', ml: 50 }}
            >
              Add New Customer
            </Link>
            
          </Box> 
          <FormControl fullWidth>
            <InputLabel id="order-decision-label">Order Decision</InputLabel>
            <Select
              labelId="order-decision-label"
              id="order-decision-select"
              value={newSale.orderDecision}
              label="Order Decision"
              onChange={(e) => setNewSale({ ...newSale, orderDecision: e.target.value })}
              error={Boolean(formErrors.orderDecision)}
            >
              <MenuItem value="Quoted">Quoted</MenuItem>
              <MenuItem value="Confirmed">Confirmed</MenuItem>
            </Select>
            {formErrors.orderDecision && <FormHelperText error>{formErrors.orderDecision}</FormHelperText>}  
          </FormControl>



          {/* Multi-select for Product Names */}
          {newSale.products.map((product, index) => (
            <Grid container spacing={2} key={index}>
              <Grid item xs={6}>
                <Autocomplete
                  options={products}
                  getOptionLabel={(option) => option.prodName}
                  getOptionKey={(option) => option.prodId}
                  onChange={(event, newValue) => {
                    const newProds = [...newSale.products];
                    newProds[index].prodId = newValue ? newValue.prodId : '';
                    setNewSale({ ...newSale, products: newProds });

                    console.log(newSale)
                  }}
                  renderInput={(params) => <TextField {...params} label="Product Names" margin="normal" 
                  error={Boolean(formErrors.products)}
                  />}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Quantity"
                  fullWidth
                  name="productQuantity"
                  value={product.quantity}
                  onChange={(e) => handleQuantityInput(index, e)}
                  margin="normal"
                   error={Boolean(formErrors.quantities)}
    helperText={index === 0 && formErrors.quantities}
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={() => handleRemoveProduct(index)} color="error">
                  <CancelPresentationIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button onClick={handleAddNewProduct} startIcon={<AddIcon />} variant="contained">
            Add Product
          </Button>


          <TextField
            margin="dense"
            label="Discount Percent"
            name="discountPercent"
            fullWidth
            onChange={handleInputChange}
            error={Boolean(formErrors.discountPercent)}
  helperText={formErrors.discountPercent}  
          />

          





          <TextField
            type="date"
            margin="dense"
            label="Promised Delivery Date"
            InputLabelProps={{ shrink: true }}
            name="orderDeliveryDate"
            fullWidth
            onChange={handleInputChange}
            
            inputProps={{
              min: dayjs().format("YYYY-MM-DD") // Ensure only future dates are selectable   
            }}
            error={Boolean(formErrors.orderDeliveryDate)}  
            helperText={formErrors.orderDeliveryDate}  
          />


          <p>Order Creating Time: {new Date().toLocaleDateString() + ", " + new Date().toLocaleTimeString()}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddOrder} color="secondary">
            Add Order
          </Button>
        </DialogActions>
      </Dialog>




      <TableContainer >
        <Table sx={{ border: '1px solid grey', mt: 3, ml: 3 }}>
          <TableHead sx={{ border: '1px solid grey', mt: 3, ml: 3 }}>
            <TableRow style={tableRowStyles}>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'customerName'}
                  direction={sortDirection}
                  onClick={() => handleSort('customerName')}
                >
                  Customer Name
                </TableSortLabel>

              </TableCell>
              <TableCell>Order Decision</TableCell>

              <TableCell>Order Status</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'orderCreatedDate'}
                  direction={sortDirection}
                  onClick={() => handleSort('orderCreatedDate')}
                >
                  Order Created Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'orderDeliveryDate'}
                  direction={sortDirection}
                  onClick={() => handleSort('orderDeliveryDate')}
                >
                  Order Delivery Date
                </TableSortLabel>
              </TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Updated By</TableCell>
              <TableCell>Updated Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
        
            {sortedSales
              .filter((sale) => !orderStatusFilter || sale.orderStatus.toLowerCase() === orderStatusFilter.toLowerCase())
              .filter((sale) => !orderDecisionFilter || sale.orderDecision.toLowerCase() === orderDecisionFilter.toLowerCase())
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((sale) => (
                <TableRow key={sale.saleId}>
                  <TableCell>{sale.customerName}</TableCell>
                  <TableCell>
                    <Chip
                      label={sale.orderDecision.toUpperCase()}
                      color={
                        sale.orderDecision === 'confirmed' || sale.orderDecision === 'Confirmed'
                          ? 'success'
                          : sale.orderDecision === 'quoted' || sale.orderDecision === 'Quoted'
                            ? 'warning'
                            : 'default'
                      }
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={sale.orderStatus.toUpperCase()}
                      color={
                        sale.orderStatus === 'pending' || sale.orderStatus === 'Pending'
                          ? 'warning'
                          : sale.orderStatus === 'shipped' || sale.orderStatus === 'Shipped'
                            ? 'success'
                            : sale.orderStatus === 'delivered' || sale.orderStatus === 'Delivered'
                              ? 'error'
                              : 'default'
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatDate(sale.orderCreatedDate)}</TableCell>
                  <TableCell>{formatDate(sale.orderDeliveryDate)}</TableCell>
                  <TableCell>{sale.createdBy.firstName}</TableCell>
                  <TableCell>{sale.updatedBy?.firstName || '-'}</TableCell>
                  <TableCell>{sale.updatedDate ? formatDate(sale.updatedDate) : formatDate(sale.orderCreatedDate)}</TableCell>
                  <TableCell>
                    {/* Button Alignment */}
                    <Box display="flex" flexDirection="row" gap={1}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEdit(sale)}
                        startIcon={<Edit />}
                        sx={{ width: '10%', padding: '6px 6px' }}  // Reduced width and padding for smaller size
                      >

                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(sale.saleId)}
                        disabled={sale.orderDecision.toLowerCase() ==="confirmed" }
                        startIcon={<Delete />}
                        sx={{ width: '10%', padding: '6px 6px' }}  // Reduced width and padding for smaller size
                      >

                      </Button>

                    
                      {/* New View Details Dropdown */}
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => toggleDetails(sale.saleId)}
                        startIcon={<ExpandMore />}
                        sx={{ width: '50%', padding: '6px 12px' }}  // Reduced width and padding for smaller size
                      >
                        View Details
                      </Button>
                    </Box>

                    {/* View Details Box */}
                  
                    {expandedDetails[sale.saleId] && (
                      <Paper
                        elevation={3}
                        sx={{
                          mt: 2,
                          p: 1.5, // Reduce padding to decrease spacing
                          backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : theme.palette.background.paper,
                          borderRadius: '8px',
                          border: '1px solid #ccc',
                          maxWidth: '400px' // Set a max-width to control the size of the box
                        }}
                      >
                        <Grid container spacing={1}>
                          {sale.products.map((product, index) => (
                            <Grid item xs={12} key={product.prodId}>
                              <Typography variant="body1" component="div">
                                <strong>{product.prodName}:</strong> {Array.isArray(sale.quantities) ? sale.quantities[index] : sale.quantities} units
                              </Typography>
                            </Grid>
                          ))}
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body1" component="div">
                              <strong>Discount:</strong> {sale.discountPercent}%
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body1" component="div">
                              <strong>Total Price:</strong> ${sale.totalPrice.toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body1" component="div">
                              <strong>Final Price:</strong> ${sale.finalPrice.toFixed(2)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    )}

                  </TableCell>

                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>


    

      <TablePagination
        component="div"
        count={filteredSales.length}  // Use filtered sales count
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />


      {/* Dialog for deleting sale */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this sale? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for editing sale */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Sale</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Customer Name"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            fullWidth
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="edit-order-decision-label">Order Decision</InputLabel>
            <Select
              labelId="edit-order-decision-label"
              id="edit-order-decision-select"
              value={formData.orderDecision}
              label="Order Decision"
              onChange={(e) => setFormData({ ...formData, orderDecision: e.target.value })}
            >
              <MenuItem value="Quoted">Quoted</MenuItem>
              <MenuItem value="confirmed">confirmed</MenuItem>
            </Select>
          </FormControl>

          <TextField
            disabled
            margin="dense"
            label="Product IDs (comma-separated)"
            name="productIds"
           
            value={products.filter(p => formData.productIds.indexOf(p.prodId) > -1).map(p => p.prodName).join(',')}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Quantities (comma-separated)"
            name="quantities"
            value={formData.quantities.join(',')}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Discount Percent"
            name="discountPercent"
            value={formData.discountPercent}
            onChange={handleChange}
            fullWidth
          />

          <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
            <InputLabel id="edit-order-status-label">Order Status</InputLabel>
            <Select
              labelId="edit-order-status-label"
              id="edit-order-status-select"
              value={formData.orderStatus}
              onChange={handleChange}
              label="Order Status"
              name="orderStatus"
            >
              {shippingOptions.map((opt, idx) => <MenuItem key={idx} value={opt}>{opt}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField
          type="date"
            margin="dense"
            label="Promised Delivery Date"
            name="orderDeliveryDate"
            
            value={formData.orderDeliveryDate}
            onChange={handleChange}
             inputProps={{
    min: dayjs().format("YYYY-MM-DD"), // Restrict dates to today and future dates
  }}
            fullWidth
          />

{/* <TextField
            type="date"
            margin="dense"
            label="Promised Delivery Date"
            InputLabelProps={{ shrink: true }}
            name="orderDeliveryDate"
            fullWidth
            onChange={handleInputChange}
            
            inputProps={{
              min: dayjs().format("YYYY-MM-DD") // Ensure only future dates are selectable   
            }}
            error={Boolean(formErrors.orderDeliveryDate)}  
            helperText={formErrors.orderDeliveryDate}  
          /> */}

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Customer Dialog */}
      <CustomersDialog
        open={isCustomerDialogOpen}
        onClose={handleCloseCustomerDialog}
        onSave={async (customerData) => {
        await  handleSaveCustomer(customerData);
          setIsCustomerDialogOpen(false);
          return null;
        }}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>

  );


};

export default Sales;


