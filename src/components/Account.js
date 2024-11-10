import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Grid, Paper, TableContainer, TableCell, TableRow, TableBody, Table, TableHead, Typography, Card, CardContent, CssBaseline, TablePagination } from '@mui/material';
import ApexCharts from 'react-apexcharts';
import axios from 'axios';
import dayjs from 'dayjs';

const NewHome = ({ userDetails }) => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(3);

    // Updated orderStatusData with the total and pie chart adjustments
    const [orderStatusData, setOrderStatusData] = useState({
        series: [], 
        options: {
            chart: {
                type: 'pie',
            },
            labels: ['Pending', 'Shipped', 'Delivered'],
            plotOptions: {
                pie: {
                    donut: {
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                fontSize: '22px',
                                color: '#333',
                                formatter: function (w) {
                                    return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                                }
                            }
                        }
                    }
                }
            },
            colors: ['#FFA500', '#00E396', '#FF4560'], // Matching the image's color scheme
            responsive: [{
                breakpoint: 400,
                options: {
                    chart: {
                        width: 100
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }],
            dataLabels: {
                enabled: true,
                formatter: (val, opts) => `${opts.w.globals.series[opts.seriesIndex]}`
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val;
                    }
                }
            }
        }
    });

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/orders');
            const fetchedOrders = response.data;
            setOrders(fetchedOrders);
            filterPendingOrders(fetchedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const filterPendingOrders = (orders) => {
        const twoWeeksAgo = dayjs().subtract(14, 'days').endOf('day');

        const pending = orders.filter(order => {
            const orderDate = dayjs(order.createdDate);
            return order.status === 'Pending' && orderDate.isBefore(twoWeeksAgo);
        });

        setPendingOrders(pending);
    };

    useEffect(() => {
        const fetchOrderStatus = async () => {
            try {
                const response = await axios.get('/api/orders');
                const orders = response.data;

                const pendingCount = orders.filter(order => order.status === 'Pending').length;
                const shippedCount = orders.filter(order => order.status === 'Shipped').length;
                const deliveredCount = orders.filter(order => order.status === 'Delivered').length;

                setOrderStatusData({
                    ...orderStatusData,
                    series: [pendingCount, shippedCount, deliveredCount] // Updated data for the chart
                });
            } catch (error) {
                console.error("Error fetching order status:", error);
            }
        };

        fetchOrderStatus();
        fetchOrders();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 5, mr: 5 }}>
            <CssBaseline />
            <Typography variant="h4" sx={{ mb: 4, mt: 4 }}>
                Welcome, {userDetails?.firstName} {userDetails?.lastName}
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={6}>
                    <Card sx={{ mb: 3, mt: 3, borderRadius: '12px', height: 380 }}>
                        <CardContent sx={{ padding: '16px' }}>
                            <Typography variant="h5">
                                <u>Pending Orders Older than 2 Weeks: {pendingOrders.length}</u>
                            </Typography>
                            <TableContainer component={Paper} sx={{ mt: 2 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Supplier Name</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Created Date</TableCell>
                                            <TableCell>Raw Material Name</TableCell>
                                            <TableCell>Quantity</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pendingOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                                            <TableRow key={order.orderId}>
                                                <TableCell>{order.supplierName}</TableCell>
                                                <TableCell>{order.status}</TableCell>
                                                <TableCell>{dayjs(order.createdDate).format('YYYY-MM-DD')}</TableCell>
                                                <TableCell>{order.rawMaterialName}</TableCell>
                                                <TableCell>{order.rawMaterialQuantity}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <TablePagination
                                    rowsPerPageOptions={[3]}
                                    component="div"
                                    count={pendingOrders.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Card sx={{ mb: 3, borderRadius: '12px' }}>
                        <CardContent>
                            <Typography variant="h5">Order Status</Typography>
                            <ApexCharts options={orderStatusData.options} series={orderStatusData.series} type="donut" height={300} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default NewHome;
