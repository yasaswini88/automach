import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Button, TablePagination
} from '@mui/material';
import { formatDate } from '../utils/utilities';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import { useTheme } from '@mui/material/styles';

const DeliveredOrders = ({ userDetails }) => {

    const theme = useTheme();
    const [deliveredOrders, setDeliveredOrders] = useState([]);
    const [users, setUsers] = useState([]); // Store user data
    const rawMaterials = useSelector((state) => state.rawMaterials.rawMaterials);

    const navigate = useNavigate(); // Create a navigate function to use for navigation

    const [page, setPage] = useState(0); // State for pagination page
    const [rowsPerPage, setRowsPerPage] = useState(5); // State for rows per page
    const [sortColumn, setSortColumn] = useState(null); // Track which column is sorted
    const [sortDirection, setSortDirection] = useState('asc'); // Track the sort direction ('asc' or 'desc')

    useEffect(() => {
        // Fetch delivered orders
        axios.get('http://localhost:8080/api/orders?status=Delivered')
            .then(response => setDeliveredOrders(response.data))
            .catch(error => console.error('Error fetching delivered orders:', error));

        // Fetch users data
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/users');
            setUsers(response.data); // Store users data in state
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const getUserNameById = (userId) => {
        const user = users.find((user) => user.userId === userId);
        return user ? `${user.firstName} ${user.lastName}` : '-';
    };

    // Handle sorting of columns
    const handleSort = (column) => {
        const isAsc = sortColumn === column && sortDirection === 'asc';
        const newDirection = isAsc ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(newDirection);

        const sortedOrders = [...deliveredOrders].sort((a, b) => {
            if (column === 'rawMaterialName' || column === 'supplierName') {
                // Sorting by strings
                return isAsc
                    ? a[column].localeCompare(b[column])
                    : b[column].localeCompare(a[column]);
            } else if (column === 'updatedDate') {
                // Sorting by date
                return isAsc
                    ? new Date(a[column]) - new Date(b[column])
                    : new Date(b[column]) - new Date(a[column]);
            }
            return 0; // If no valid column is provided
        });

        setDeliveredOrders(sortedOrders);
    };

    // Handle page change for pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Handle change of rows per page
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page when changing rows per page
    };

     // Styling adjustments for light and dark modes
  const tableRowStyles = {
    backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#f0f0f0',
    borderBottom: `1px solid ${theme.palette.divider}`,
  };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Delivered Orders
            </Typography>

            {/* Back to Orders Button */}
            <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/orders')} // Navigate back to Orders page
                sx={{ mb: 3 }} // Add margin below the button
            >
                Back to Orders
            </Button>

            <TableContainer  component={Paper} sx={{ mt: 3, border: '1px solid grey' }}>
                <Table sx={{ border: '1px solid grey' }}>
                    <TableHead>
                        <TableRow style={tableRowStyles}>
                            <TableCell
                                onClick={() => handleSort('rawMaterialName')}
                                style={{ cursor: 'pointer' }}
                            >
                                Raw Material Name {sortColumn === 'rawMaterialName' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell
                                onClick={() => handleSort('supplierName')}
                                style={{ cursor: 'pointer' }}
                            >
                                Supplier Name {sortColumn === 'supplierName' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </TableCell>
                            <TableCell>Created By</TableCell>
                            <TableCell>Created Date</TableCell>
                            <TableCell>Received By</TableCell>
                            <TableCell
                                onClick={() => handleSort('updatedDate')}
                                style={{ cursor: 'pointer' }}
                            >
                                Delivered Date {sortColumn === 'updatedDate' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {deliveredOrders
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((order) => (
                                <TableRow key={order.orderId}>
                                    <TableCell>{order.rawMaterialName}</TableCell>
                                    <TableCell>{order.rawMaterialQuantity}</TableCell>
                                    <TableCell>{order.supplierName}</TableCell>
                                    <TableCell>{getUserNameById(order.createdBy)}</TableCell>
                                    <TableCell>{formatDate(order.createdDate)}</TableCell>
                                    <TableCell>{getUserNameById(order.updatedBy)}</TableCell>
                                    <TableCell>{formatDate(order.updatedDate)}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={deliveredOrders.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]} // Options for rows per page
                />
            </TableContainer>
        </Box>
    );
};

export default DeliveredOrders;
