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
    TableSortLabel,
    Snackbar,
    CircularProgress,
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom'; 
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Inventory = ({ userDetails }) => {

    const theme = useTheme();
    const navigate = useNavigate();
    const [inventory, setInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchValue, setSearchValue] = useState(null);
    const [sortColumn, setSortColumn] = useState('');
    const [products, setProducts] = useState([]);
    const [sortDirection, setSortDirection] = useState('asc');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(false);


    const mapInventoryWithProductNames = (inventoryData, productsData) => {
        return inventoryData.map(item => {
            const product = productsData.find(p => p.prodId === item.productId);
            return {
                ...item,
                productName: product ? product.prodName : 'Unknown Product',
                blockedQuantity: item.blockedQuantity || 0,
                requiredQuantity: item.requiredQuantity || 0,
            };
        });
    };

    
    

    // useEffect(() => {
    //     axios.get('http://localhost:8080/api/inventory/')
    //         .then(inventoryResponse => {
    //             console.log("Inventory Data: ", inventoryResponse.data);

    //             axios.get('http://localhost:8080/api/products')
    //                 .then(productsResponse => {
    //                     console.log("Products Data: ", productsResponse.data);

    //                     const products = productsResponse.data;
    //                     const inventoryWithProductNames = inventoryResponse.data.map(item => {
    //                         const product = products.find(p => p.prodId === item.productId);
    //                         console.log("Matching Product: ", product);
    //                         return {
    //                             ...item,
    //                             productName: product ? product.prodName : 'Unknown Product',
    //                             blockedQuantity: item.blockedQuantity || 0,   // Ensure blockedQuantity is shown
    //                             requiredQuantity: item.requiredQuantity || 0, // Ensure requiredQuantity is shown
    //                         };
    //                     });
    //                     setInventory(inventoryWithProductNames);
    //                     setFilteredInventory(inventoryWithProductNames);
    //                 })
    //                 .catch(error => console.error('Error fetching products:', error));
    //         })
    //         .catch(error => console.error('Error fetching inventory:', error));
    // }, []);

    useEffect(() => {
        axios.get('http://localhost:8080/api/inventory/')
            .then(inventoryResponse => {
                axios.get('http://localhost:8080/api/products')
                    .then(productsResponse => {
                        const products = productsResponse.data;
                        const mappedInventory = mapInventoryWithProductNames(inventoryResponse.data, products);
                        setInventory(mappedInventory);
                        setFilteredInventory(mappedInventory);
                        setProducts(products); // Store products for later use
                    })
                    .catch(error => console.error('Error fetching products:', error));
            })
            .catch(error => console.error('Error fetching inventory:', error));
    }, []);
    


    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

   


    //handle update along with user messages 
    // const handleUpdate = (index) => {
    //     const actualIndex = page * rowsPerPage + index;
    //     const updatedItem = filteredInventory[actualIndex];
    
    //     if (!updatedItem.inventoryId) {
    //         console.error('Error: updatedItem.inventoryId is undefined');
    //         return;
    //     }
    
    //     setLoading(true);
    //     const payload = {
    //         quantity: updatedItem.quantity,
    //     };
    
        
    //     axios.put(`http://localhost:8080/api/inventory/${updatedItem.inventoryId}/quantity`, payload)
    //         .then(response => {
    //             const updatedInventory = [...inventory];
    //             updatedInventory[actualIndex] = response.data;
    //             setInventory(updatedInventory);
    //             setFilteredInventory(updatedInventory);
    //             setSnackbar({ open: true, message: 'Stock updated successfully!', severity: 'success' });
    //         })
    //         .catch(error => {
    //             const errorMessage = error.response?.data?.message || 'Error updating inventory. Please check stock availability.';
    //             setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    //         })
    //         .finally(() => {
    //             setLoading(false);
    //         });
    // };
    

    const handleUpdate = (index) => {
        const actualIndex = page * rowsPerPage + index;
        const updatedItem = filteredInventory[actualIndex];
    
        if (!updatedItem.inventoryId) {
            console.error('Error: updatedItem.inventoryId is undefined');
            return;
        }
    
        setLoading(true);
        const payload = {
            quantity: updatedItem.quantity,
        };
    
        axios.put(`http://localhost:8080/api/inventory/${updatedItem.inventoryId}/quantity`, payload)
            .then(response => {
                const updatedInventory = [...inventory];
                updatedInventory[actualIndex] = response.data;
    
                // Reapply product names using the helper function
                const mappedInventory = mapInventoryWithProductNames(updatedInventory, products);
    
                setInventory(mappedInventory);
                setFilteredInventory(mappedInventory);
                setSnackbar({ open: true, message: 'Stock updated successfully!', severity: 'success' });
            })
            .catch(error => {
                const errorMessage = error.response?.data?.message || 'Error updating inventory. Please check stock availability.';
                setSnackbar({ open: true, message: errorMessage, severity: 'error' });
            })
            .finally(() => {
                setLoading(false);
            });
    };
    

    const handleQuantityChange = (index, event) => {
        const newInventory = [...filteredInventory];
        newInventory[page * rowsPerPage + index].quantity = Number(event.target.value);
        setFilteredInventory(newInventory);
    };


    const handleSearchChange = (event, value) => {
        setSearchValue(value);
        if (value) {
            const filtered = inventory.filter(item =>
                item.productName.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredInventory(filtered);
            setPage(0);
        } else {
            setFilteredInventory(inventory);
        }
    };


    const handleSort = (column) => {
        const isAsc = sortColumn === column && sortDirection === 'asc';
        const newDirection = isAsc ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(newDirection);

        const sorted = [...filteredInventory].sort((a, b) => {
            const aValue = a.productName.toLowerCase();
            const bValue = b.productName.toLowerCase();

            if (newDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? -1 : 1;
            }
        });

        setFilteredInventory(sorted);
    };


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    const handleProductCheckAlerts = (item) => {
        console.log(item);
        navigate(`/required-products-stock-alerts?productName=${item.productName}&requiredQuantity=${item.requiredQuantity}`)
    }

    // Styling adjustments for light and dark modes
    const tableRowStyles = {
        backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#f0f0f0',
        borderBottom: `1px solid ${theme.palette.divider}`,
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Toolbar />
            <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
                <Typography variant="h4" component="h2" gutterBottom>
                    Product Inventory
                </Typography>

                {alerts.length > 0 && (
                    <Box mb={2}>
                        {alerts.map((alert, index) => (
                            <Alert severity="warning" key={index}>
                                {alert}
                            </Alert>
                        ))}
                    </Box>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <Autocomplete
                        options={inventory.map(item => item.productName)}
                        value={searchValue}
                        onChange={handleSearchChange}
                        renderInput={(params) => (
                            <TextField {...params} label="Search by Product" variant="outlined" style={{ width: '300px', border: '1px solid #ccc' }} />
                        )}
                    />


                    <Button
                        variant="outlined"
                        onClick={() => handleSort('productName')}
                        sx={{
                            color: theme.palette.text.primary, // Adjust text color for dark mode
                            backgroundColor: theme.palette.background.paper // Adjust background color
                        }}
                    >
                        Sort by Product <SwapVertIcon style={{ marginLeft: '8px' }} />
                    </Button>


                </div>
                <TableContainer component={Paper} sx={{ border: '1px solid lightgray' }}>
                    <Table>
                        <TableHead>
                            <TableRow style={tableRowStyles}>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Available Quanity</TableCell>
                                <TableCell>Blocked Quanity</TableCell>
                                <TableCell>Required Quanity</TableCell>
                                <TableCell>Modified By</TableCell>
                                <TableCell>Last Modified</TableCell>
                                <TableCell style={{textAlign: 'center'}}>Alerts</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredInventory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
                                <TableRow key={item.inventoryId} sx={{ borderBottom: '1px solid lightgray' }}>
                                    <TableCell>{item.productName}</TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(index, e)}
                                            size="small"
                                            sx={{ width: '80px' }}
                                        />
                                        <Button onClick={() => handleUpdate(index)} color="primary">
                                            Update
                                        </Button>
                                    </TableCell>
                                    <TableCell>{item.blockedQuantity}</TableCell>  {/* Display Blocked Quantity */}
                                    <TableCell style={{ color: item.requiredQuantity > 0 ? 'red' : 'currentcolor' }}>
                                        {item.requiredQuantity}  {/* Display Required Quantity */}
                                    </TableCell>
                                    <TableCell>{userDetails?.firstName} {userDetails?.lastName}</TableCell>
                                    <TableCell>{new Date(item.modifiedDate).toLocaleString()}</TableCell>
                                    <TableCell style={{textAlign: 'center'}}>
                                        {item.requiredQuantity > 0 ? (<Button
                                        variant="text"
                                        color="warning"
                                        onClick={() => handleProductCheckAlerts(item)}
                                    >
                                        <NotificationsIcon />
                                    </Button>) : (<CheckCircleOutlineIcon sx={{ color: 'green' }} />)}
                                    
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredInventory.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message={snackbar.message}
                severity={snackbar.severity}
            />
        </Box>
    );
};

export default Inventory;
