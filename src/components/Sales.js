import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, Select, MenuItem, Box,
  DialogTitle, Button, TextField, useTheme, Chip, Grid, Autocomplete, InputLabel, FormControl, OutlinedInput, Typography
} from '@mui/material';
import { Edit, Delete, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import dayjs from "dayjs";
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import AddIcon from '@mui/icons-material/Add';
import { formatDate } from '../utils/utilities';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { TableSortLabel } from '@mui/material';
import { Snackbar, Alert } from '@mui/material';




const Sales = ({ userDetails }) => {

  const theme = useTheme();
  const [sales, setSales] = useState([]);
  const [orderStatus, setOrderStatus] = useState('');

  const [expandedRow, setExpandedRow] = useState(null);

  //snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });


  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
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
    orderStatus: "",
    orderCreatedDate: new Date(),
    createdUserId: userDetails.userId,
    orderDeliveryDate: "",
  });

  //snack bar 

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
};



  // Fetch sales data
  useEffect(() => {
    axios.get('http://localhost:8080/api/sales')
      .then(response => {
        setSales(response.data);
        setSortedSales(response.data);  // Initialize sortedSales
      })
      .catch(error => console.error('Error fetching sales:', error));
  }, []);


  useEffect(() => {
    axios.get('http://localhost:8080/api/inventory/')
      .then(response => setInventory(response.data))
      .catch(error => console.error('Error fetching sales:', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8080/api/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);


  //   const handleSort = (column) => {
  //     const isAsc = sortColumn === column && sortDirection === 'asc';
  //     const newDirection = isAsc ? 'desc' : 'asc';
  //     setSortColumn(column);
  //     setSortDirection(newDirection);

  //     const sorted = [...sales].sort((a, b) => {
  //         let aValue, bValue;
  //         switch (column) {
  //             case 'orderDecision':
  //                 aValue = a.orderDecision.toLowerCase();
  //                 bValue = b.orderDecision.toLowerCase();
  //                 break;
  //             case 'orderStatus':
  //                 aValue = a.orderStatus.toLowerCase();
  //                 bValue = b.orderStatus.toLowerCase();
  //                 break;
  //             case 'finalPrice':
  //                 aValue = a.finalPrice;
  //                 bValue = b.finalPrice;
  //                 break;
  //             default:
  //                 return 0;
  //         }

  //         if (newDirection === 'asc') {
  //             return aValue > bValue ? 1 : -1;
  //         } else {
  //             return aValue < bValue ? 1 : -1;
  //         }
  //     });

  //     setSortedSales(sorted);
  // };
  const handleOrderStatusFilterChange = (event) => {
    setOrderStatusFilter(event.target.value);
  };

  const handleOrderDecisionFilterChange = (event) => {
    setOrderDecisionFilter(event.target.value);
  };


  const handleSort = (column) => {
    const isAsc = sortColumn === column && sortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
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

      return isAsc ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    setSortedSales(sorted);
  };



  const handleDelete = (id) => {
    setSaleToDelete(id);       // Set sale ID
    setOpenDeleteDialog(true); // Open confirmation dialog
  };

  // Confirm delete method
  const confirmDelete = () => {
    axios.delete(`http://localhost:8080/api/sales/${saleToDelete}`)
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
    setOpenEdit(true);
  };

  

  // Handle save (PUT request)
// const handleSave = () => {
//   const updatedSale = {
//     ...formData,
//     updatedUserId: userDetails.userId,
//     updatedDate: new Date().toISOString(),
//     quantities: Array.isArray(formData.quantities) ? formData.quantities : formData.quantities.split(',').map(Number), // Ensure quantities is an array before saving
//   };

//   axios.put(`http://localhost:8080/api/sales/${editSale.saleId}`, updatedSale)
//     .then(response => {
//       setSales(sales.map(sale => (sale.saleId === editSale.saleId ? response.data : sale)));
//       setOpenEdit(false);
//     })
//     .catch(error => console.error("Error updating sale:", error));
// };

// Handle save (PUT request)
// Handle save (PUT request)
const handleSave = () => {

  // Extract the old quantities and product IDs from the sale being edited
  const oldQuantities = editSale.quantities || [];
  const productIds = editSale.products.map(product => product.prodId);
  console.log(oldQuantities)
  console.log(productIds )

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
    orderDecisionChangedToConfirmed: orderDecisionChangedToConfirmed // Flag to indicate change
  

  };

  axios.put(`http://localhost:8080/api/sales/${editSale.saleId}`, updatedSale)
    .then(response => {
      setSales(sales.map(sale => (sale.saleId === editSale.saleId ? response.data : sale)));
      // Refresh inventory to reflect updated blocked/required quantities
      axios.get('http://localhost:8080/api/inventory/')
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

  // // Handle form submission to add new order
  // const handleAddOrder = () => {
  //   const saleData = {
  //     customerName: newSale.customerName,
  //     orderDecision: newSale.orderDecision,
  //     productIds: newSale.products.map(p => p.prodId),  // Product IDs from the dropdown
  //     quantities: newSale.products.map(p => p.quantity),
  //     discountPercent: newSale.discountPercent,
  //     orderStatus: newSale.orderStatus,
  //     orderCreatedDate: newSale.orderCreatedDate,
  //     createdUserId: Number(newSale.createdUserId),
  //     orderDeliveryDate: newSale.orderDeliveryDate,
  //   };


  //   axios.post("http://localhost:8080/api/sales", saleData)
  //     .then(() => {
  //       setSales([...sales, saleData]);
  //       // setSales([...sales, response.data]);  // Add new sale to the sales list
  //       handleCloseAdd(); // Close the add dialog
  //     })
  //     .catch((error) => {
  //       console.error("Error adding new order:", error);
  //     });
  // };

  const handleAddOrder = () => {
    const saleData = {
      customerName: newSale.customerName,
      orderDecision: newSale.orderDecision,
      productIds: newSale.products.map(p => p.prodId),
      quantities: newSale.products.map(p => p.quantity),
      discountPercent: newSale.discountPercent,
      orderStatus: newSale.orderStatus,
      orderCreatedDate: newSale.orderCreatedDate,
      createdUserId: Number(newSale.createdUserId),
      orderDeliveryDate: newSale.orderDeliveryDate,
    };

    axios.post("http://localhost:8080/api/sales", saleData)
    .then(() => {
        axios.get('http://localhost:8080/api/sales')
            .then(response => {
                setSales(response.data);  
                setSnackbar({ open: true, message: 'Order added successfully!', severity: 'success' });
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
    axios.put(`http://localhost:8080/api/sales/${saleId}/status?status=${newStatus}`)
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
  <Button variant="contained" color="primary" onClick={handleClickOpenAdd}>
    Add New Order
  </Button>

  {/* Filters */}
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
</Box>


      {/* <FormControl sx={{ ml: 3, minWidth: 200 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
            value={sortColumn}
            onChange={(e) => handleSort(e.target.value)}
        >
            <MenuItem value="orderDecision">Order Decision</MenuItem>
            <MenuItem value="orderStatus">Order Status</MenuItem>
            <MenuItem value="finalPrice">Final Price</MenuItem>
        </Select>
    </FormControl> */}

      {/* Dialog for adding new order */}
      <Dialog open={openAdd} onClose={handleCloseAdd}>
        <DialogTitle>Add New Order</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Customer Name"
            name="customerName"
            fullWidth
            onChange={handleInputChange}
          />
          <FormControl fullWidth>
            <InputLabel id="order-decision-label">Order Decision</InputLabel>
            <Select
              labelId="order-decision-label"
              id="order-decision-select"
              value={newSale.orderDecision}
              label="Order Decision"
              onChange={(e) => setNewSale({ ...newSale, orderDecision: e.target.value })}
            >
              <MenuItem value="Quoted">Quoted</MenuItem>
              <MenuItem value="Confirmed">Confirmed</MenuItem>
            </Select>
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
                  renderInput={(params) => <TextField {...params} label="Product Names" margin="normal" />}
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
          />

          <FormControl fullWidth>
            <InputLabel id="order-status-label">Order Status</InputLabel>
            <Select
              labelId="order-status-label"
              id="order-status-select"
              value={newSale.orderStatus}
              label="Order Status"
              onChange={(e) => setNewSale({ ...newSale, orderStatus: e.target.value })}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              {/* {/* <MenuItem value="Shipped">Shipped</MenuItem> */}
              <MenuItem value="Delivered">Delivered</MenuItem> 
            </Select>
          </FormControl>



          <TextField
            type='date'
            margin="dense"
            label="Order Delivery Date"
            InputLabelProps={{ shrink: true }}
            name="orderDeliveryDate"
            fullWidth
            onChange={handleInputChange}
          />
          <p>Order Creating Time: {new Date().toLocaleDateString() + ", " + new Date().toLocaleTimeString()}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddOrder} color="primary">
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
                      label={sale.orderDecision}
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
                      label={sale.orderStatus}
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
        count={sales.length}
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
            // value={formData.productIds.join(',')}
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
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Shipped">Shipped</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Order Delivery Date"
            name="orderDeliveryDate"
            type="date"
            value={formData.orderDeliveryDate}
            onChange={handleChange}
            fullWidth
          />
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


