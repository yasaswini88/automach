import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Snackbar, Alert, TablePagination } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import CustomersDialog from './CustomersDialog';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const Customers = () => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleDialogOpen = (customer = null) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCustomer(null);
  };

  const handleSaveCustomer = async (customer) => {
    try {
      if (selectedCustomer) {
        await axios.put(`/api/customers/${selectedCustomer.id}`, customer);
        setSnackbar({ open: true, message: 'Customer updated successfully!', severity: 'success' });
      } else {
        await axios.post('/api/customers', customer);
        setSnackbar({ open: true, message: 'Customer added successfully!', severity: 'success' });
      }
      fetchCustomers();
      handleDialogClose();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save customer!', severity: 'error' });
      console.error('Error saving customer:', error);
    }
  };

  const handleDeleteCustomer = (customerId) => {
    setCustomerToDelete(customerId);
    setConfirmDelete(true);
  };

  const confirmDeleteCustomer = async () => {
    try {
      await axios.delete(`/api/customers/${customerToDelete}`);
      setSnackbar({ open: true, message: 'Customer deleted successfully!', severity: 'success' });
      fetchCustomers();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete customer!', severity: 'error' });
      console.error('Error deleting customer:', error);
    } finally {
      setConfirmDelete(false);
      setCustomerToDelete(null);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSort = (column) => {
    const isAsc = sortColumn === column && sortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);

    const sorted = [...customers].sort((a, b) => {
      const aValue = a[column].toLowerCase();
      const bValue = b[column].toLowerCase();

      if (newDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setCustomers(sorted);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <Paper>
      <Button variant="outlined" color="secondary" onClick={() => handleDialogOpen()}
        style={{ margin: isMobile ? '8px' : '16px' }}>
        Add New Customer
      </Button>
      <TableContainer style={{ border: '1px solid #ccc', marginLeft: '20px', marginRight: '20px' }}>


        <Table sx={{ border: `1px solid` }}>

          <TableHead style={{ backgroundColor: '#f5f5f5' }}>

            <TableRow>
              <TableCell>
                <Button
                  variant="outlined"
                  onClick={handleSort.bind(null, 'customerName')}
                  endIcon={<SwapVertIcon />} // Adds the sorting icon at the end of the text
                >
                  Customer Name
                </Button>
              </TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>City</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Postal Code</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.customerName}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phoneNumber}</TableCell>
                <TableCell>{customer.addressLine1} {customer.addressLine2}</TableCell>
                <TableCell>{customer.city}</TableCell>
                <TableCell>{customer.state}</TableCell>
                <TableCell>{customer.postalCode}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleDialogOpen(customer)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteCustomer(customer.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={customers.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <CustomersDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSave={handleSaveCustomer}
        customerData={selectedCustomer}
      />
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        fullWidth={isMobile} maxWidth={isMobile ? 'xs' : 'sm'}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this customer?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteCustomer} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default Customers;