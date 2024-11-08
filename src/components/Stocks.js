import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Toolbar,
  Typography,
  Alert,
  Autocomplete,
  TableSortLabel
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { Snackbar } from '@mui/material';


const Stocks = ({ userDetails }) => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [alerts, setAlerts] = useState({ critical: [], low: [], medium: [] });
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [alertPage, setAlertPage] = useState(0); // Pagination state for alerts
  const [alertsPerPage, setAlertsPerPage] = useState(3); // Show only 3 alerts per page
  const [searchValue, setSearchValue] = useState(null);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    axios.get('http://localhost:8080/api/rawMaterialStock')
      .then(response => {
        setStocks(response.data);
        setFilteredStocks(response.data); // Initialize filtered stocks

        // Filter only the materials with quantity below minimum and categorize them
        const categorizedAlerts = {
          critical: [],
          medium: [],
          low: []
        };

        response.data.forEach(stock => {
          const { materialName } = stock.rawMaterial;
          const { quantity, minQuantity } = stock;

          // Only consider materials below the minimum quantity
          if (quantity < minQuantity) {
            if (quantity < minQuantity / 2) {
              categorizedAlerts.critical.push(
                `Critical stock alert: ${materialName} is critically low with ${quantity} units remaining.`
              );
            } else if (quantity < minQuantity && quantity >= minQuantity / 1.5) {
              categorizedAlerts.medium.push(
                `Medium stock alert: ${materialName} is close to the threshold with ${quantity} units remaining.`
              );
            } else if (quantity < minQuantity) {
              categorizedAlerts.low.push(
                `Low stock alert: ${materialName} is below threshold with ${quantity} units remaining.`
              );
            }

          }
        });

        // Sort the alerts alphabetically by the raw material name
        Object.keys(categorizedAlerts).forEach(category => {
          categorizedAlerts[category] = categorizedAlerts[category]
            .map(alert => alert)
            .sort((a, b) => {
              const aName = a.split(': ')[1].split(' ')[0].toLowerCase();
              const bName = b.split(': ')[1].split(' ')[0].toLowerCase();
              return aName > bName ? 1 : -1;
            });
        });

        setAlerts(categorizedAlerts);
      })
      .catch(error => {
        console.error('Error fetching stocks:', error.response ? error.response.data : error.message);
      });
  }, []);

  //snack bar 
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle when a user clicks one of the alert buttons
  const handleAlertClick = (alertType) => {
    setSelectedAlerts(alerts[alertType]);
  };

  const handleUpdate = (index) => {
    const actualIndex = page * rowsPerPage + index;
    const updatedStock = filteredStocks[actualIndex];

    if (!updatedStock.raw_material_stock_id) {
      console.error('Error: updatedStock.raw_material_stock_id is undefined');
      return;
    }

    const currentTime = new Date().toISOString();
    const payload = {
      rawMaterialId: updatedStock.rawMaterial.id,
      quantity: updatedStock.quantity,
      dateModified: currentTime,
      modifiedBy: userDetails || null,
      minQuantity: updatedStock.minQuantity
    };

    axios.put(`http://localhost:8080/api/rawMaterialStock/${updatedStock.raw_material_stock_id}`, payload)
      .then(response => {
        const updatedStocks = [...stocks];
        updatedStocks[actualIndex] = response.data;
        setStocks(updatedStocks);

        // Set success message in Snackbar
        setSnackbar({ open: true, message: 'Stock updated successfully!', severity: 'success' });

        // Update the alerts after modification
        const categorizedAlerts = {
          critical: [],
          medium: [],
          low: []
        };

        updatedStocks.forEach(stock => {
          const { materialName } = stock.rawMaterial;
          const { quantity, minQuantity } = stock;

          if (quantity < minQuantity) {
            if (quantity < minQuantity / 2) {
              categorizedAlerts.critical.push(
                `Critical stock alert: ${materialName} is critically low with ${quantity} units remaining.`
              );
            } else if (quantity < minQuantity) {
              categorizedAlerts.low.push(
                `Low stock alert: ${materialName} is below threshold with ${quantity} units remaining.`
              );
            } else if (quantity < minQuantity * 1.5) {
              categorizedAlerts.medium.push(
                `Medium stock alert: ${materialName} is close to the threshold with ${quantity} units remaining.`
              );
            }
          }
        });

        setAlerts(categorizedAlerts);
      })
      .catch(error => {
        // Set error message in Snackbar
        setSnackbar({ open: true, message: 'Error updating stock.', severity: 'error' });
        console.error('Error updating stock:', error.response ? error.response.data : error.message);
      });
  };

  const handleQuantityChange = (index, event) => {
    const newStocks = [...filteredStocks];
    newStocks[page * rowsPerPage + index].quantity = Number(event.target.value);
    setFilteredStocks(newStocks);
  };

  const handleSearchChange = (event, value) => {
    setSearchValue(value);
    if (value) {
      const filtered = stocks.filter(stock =>
        stock.rawMaterial.materialName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStocks(filtered);
      setPage(0);
    } else {
      setFilteredStocks(stocks); // Reset to full list if search is cleared
    }
  };

  const handleSort = (column) => {
    const isAsc = sortColumn === column && sortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);

    const sorted = [...filteredStocks].sort((a, b) => {
      const aValue = a.rawMaterial.materialName.toLowerCase();
      const bValue = b.rawMaterial.materialName.toLowerCase();

      if (newDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredStocks(sorted);
  };

  // Handle alert pagination
  const handleAlertPageChange = (event, newPage) => {
    setAlertPage(newPage);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Toolbar />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Raw Material Stocks
        </Typography>

        {/* Alert Buttons */}
        <Box mb={2}>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAlertClick('critical')}
            sx={{ marginRight: 2 }}
          >
            Critical Alerts ({alerts.critical.length})
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => handleAlertClick('low')}
            sx={{ marginRight: 2 }}
          >
            Low Alerts ({alerts.low.length})
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={() => handleAlertClick('medium')}
          >
            Medium Alerts ({alerts.medium.length})
          </Button>
        </Box>

        {/* Display Selected Alerts */}
        {selectedAlerts.length > 0 && (
          <Box mb={2}>
            {selectedAlerts
              .slice(alertPage * alertsPerPage, alertPage * alertsPerPage + alertsPerPage)
              .map((alert, index) => (
                <Alert severity="error" key={index}>
                  {alert}
                </Alert>
              ))}
            <TablePagination
              component="div"
              count={selectedAlerts.length}
              page={alertPage}
              onPageChange={handleAlertPageChange}
              rowsPerPage={alertsPerPage}
              rowsPerPageOptions={[]}
            />
          </Box>
        )}
        {/* Snackbar for update notifications */}
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


        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          {/* Search by Raw Material Name */}
          <Autocomplete
            options={stocks.map(stock => stock.rawMaterial.materialName)}
            value={searchValue}
            onChange={handleSearchChange}
            renderInput={(params) => (
              <TextField {...params} label="Search Raw Material" variant="outlined" style={{ width: '300px', border: '1px solid lightgray' }} />
            )}
          />
        </div>

        <TableContainer component={Paper} sx={{ border: '1px solid lightgray' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === 'rawMaterialName'}
                    direction={sortDirection}
                    onClick={() => handleSort('rawMaterialName')}
                    IconComponent={SwapVertIcon}
                  >
                    Raw Material Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Raw Material Quantity</TableCell>
                <TableCell>Min Quantity</TableCell>
                <TableCell>Update Quantity</TableCell>
                <TableCell>Modified By</TableCell>
                <TableCell>Time Modified</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStocks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((stock, index) => (
                <TableRow key={stock.raw_material_stock_id} sx={{ borderBottom: '1px solid lightgray' }}>
                  {/* <TableCell>{stock.rawMaterial.materialName}</TableCell> */}
                  <TableCell>
                    {stock.rawMaterial.materialName.charAt(0).toUpperCase() + stock.rawMaterial.materialName.slice(1).toLowerCase()}
                  </TableCell>

                  <TableCell>{stock.quantity}</TableCell>
                  <TableCell>{stock.minQuantity}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={stock.quantity}
                      onChange={(e) => handleQuantityChange(index, e)}
                      size="small"
                      sx={{ width: '80px' }}
                    />
                    <Button onClick={() => handleUpdate(index)} color="primary">
                      Update
                    </Button>
                  </TableCell>
                  <TableCell>{`${stock.modifiedBy?.firstName || userDetails?.firstName} ${stock.modifiedBy?.lastName || userDetails?.lastName}`}</TableCell>
                  <TableCell>{new Date(stock.dateModified).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredStocks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </Box>
  );
};

export default Stocks;
