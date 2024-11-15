import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Grid, Collapse, Table, TableHead, Paper, TableContainer, TableCell, TableRow, TableBody, Button, CssBaseline, useTheme, Card, CardContent, Typography, TablePagination } from '@mui/material';
import ApexCharts from 'react-apexcharts';
import axios from 'axios';
import dayjs from 'dayjs';
import ErrorIcon from '@mui/icons-material/Error';


const NewHome = ({ userDetails }) => {
    const navigate = useNavigate();
    const theme = useTheme();

    const [orders, setOrders] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [stockAlerts, setStockAlerts] = useState([]);


    // Updated orderStatusData with the total and pie chart adjustments
    const [orderStatusData, setOrderStatusData] = useState({
        series: [0, 0, 0],  // Default to 0 for each status to avoid undefined errors
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
                                color: '#ff0000',
                                formatter: function (w) {
                                    return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                }
                            }
                        }
                    }
                }
            },
            colors: ['#FFA500', '#00E396', '#FF4560'],
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
                formatter: (val, opts) => {
                    const safeValue = opts.w.globals.series[opts.seriesIndex];
                    return typeof safeValue === 'number' ? `${safeValue}` : '0';  // Ensure we have a number
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return typeof val === 'number' ? val.toString() : '0';  // Ensure we return a string
                    }
                }
            }
        }
    });

    const [salesData, setSalesData] = useState([]);
    const [deliveryOrders, setDeliveryOrders] = useState([]);
    
const [deliveryStatusData, setDeliveryStatusData] = useState({
    series: [0, 0, 0],  // Default to 0 for each status to avoid undefined errors
    options: {
        chart: {
            type: 'donut',
        },
        labels: ['Pending', 'Shipped', 'Delivered'],
        colors: ['#FFA500', '#00E396', '#FF4560'],
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total',
                            fontSize: '22px',
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                            }
                        }
                    }
                }
            }
        },
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
        tooltip: {
            y: {
                formatter: function (val) {
                    return val !== undefined && val !== null ? val.toString() : "0";
                }
            }
        }
    }
});



    const fetchSalesData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/sales');
            const sales = response.data;

            const oneWeekFromToday = dayjs().add(7, 'days').endOf('day');

            // Filter sales to get orders that need to be delivered within the next 7 days
            const deliverySales = sales.filter(sale =>
                dayjs(sale.orderDeliveryDate).isBefore(oneWeekFromToday) &&
                dayjs(sale.orderDeliveryDate).isAfter(dayjs())
            );

            setDeliveryOrders(deliverySales);

            // Count order statuses
            const pendingCount = deliverySales.filter(order => order.orderStatus === 'Pending').length;
            const shippedCount = deliverySales.filter(order => order.orderStatus === 'Shipped').length;
            const deliveredCount = deliverySales.filter(order => order.orderStatus === 'Delivered').length;

            // Set the donut chart data
            setDeliveryStatusData({
                ...deliveryStatusData,
                series: [
                    Number(pendingCount) || 0,  // Ensure this is a number
                    Number(shippedCount) || 0,  // Ensure this is a number
                    Number(deliveredCount) || 0 // Ensure this is a number
                ]
            });
        } catch (error) {
            console.error("Error fetching sales data:", error);
        }
    };
 

    useEffect(() => {
        fetchSalesData();  // Fetch sales data on component mount
    }, []);



    const [rawMaterialData, setRawMaterialData] = useState({
        series: [
            {
                name: 'Current Quantity',
                data: [],
                color: '#90caf9'  // Light blue for Current Quantity
            },
            {
                name: 'Min Quantity',
                data: [],
                color: '#FF4560'  // Red for Min Quantity
            }
        ],
        options: {
            chart: {
                type: 'bar',  // Ensuring the chart is a bar chart
                zoom: {
                    enabled: true,
                    type: 'x',  // Horizontal zoom
                    autoScaleYaxis: true  // Automatically scale Y-axis
                },
                toolbar: {
                    autoSelected: 'zoom',
                    tools: {
                        zoomin: true,
                        zoomout: true,
                        reset: true,
                    }
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '50%',  // Set width for better visibility
                    endingShape: 'rounded'  // Rounded bars for smooth styling
                }
            },
            xaxis: {
                categories: [],  // Will be populated dynamically
                tickPlacement: 'on',
                title: {
                    text: 'Raw Materials'
                },
                labels: {
                    rotate: -45,  // For better readability
                    style: {
                        fontSize: '12px',
                    }
                },
                scrollbar: {
                    enabled: true,  // Enable scrollbar for horizontal scrolling
                    height: 8,
                    borderRadius: 10,
                    barBackgroundColor: '#e7e7e7',
                    barBorderRadius: 10,
                    barBorderColor: '#CCCCCC',
                }
            },
            yaxis: {
                title: {
                    text: 'Quantity'
                },
            },
            colors: ['#00BFFF', '#FF4560'],  // Colors for current and min quantities
            tooltip: {
                shared: false,
                intersect: true,
                y: {
                    formatter: function (value, { dataPointIndex }) {
                        const minQuantity = rawMaterialData.series[1].data[dataPointIndex];
                        return value < minQuantity ? `${value} (Low)` : `${value} units`;
                    }
                }
            },
            legend: {
                show: true,
                position: 'top',  // Place legend at the top like the example
                horizontalAlign: 'center',
            },
            grid: {
                show: true,  // Show grid lines for better readability
                borderColor: '#e7e7e7',
            }
        }
    });



    // Pagination States
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(3);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/orders');
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

    const handleAccordionToggle = () => {
        setExpanded(!expanded);
    };

    useEffect(() => {
        const fetchOrderStatus = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/orders');
                const orders = response.data;

                const twoWeeksAgo = dayjs().subtract(14, 'days').startOf('day'); // get date 2 weeks ago
                const filteredOrders = orders.filter(order =>
                    dayjs(order.createdDate).isAfter(twoWeeksAgo)
                );

                const pendingCount = filteredOrders.filter(order => order.status === 'Pending').length;
                const shippedCount = filteredOrders.filter(order => order.status === 'Shipped').length;
                const deliveredCount = filteredOrders.filter(order => order.status === 'Delivered').length;

                setOrderStatusData({
                    ...orderStatusData,
                    series: [
                        Number(pendingCount) || 0,  // Ensure this is a number
        Number(shippedCount) || 0,  // Ensure this is a number
        Number(deliveredCount) || 0 // Ensure this is a number
                    ]
                });
            } catch (error) {
                console.error("Error fetching order status:", error);
            }
        };

        const fetchRawMaterialData = async () => {
            try {
                // Step 1: Fetch the top 10 most commonly used raw materials
                const topRawMaterialsResponse = await axios.get('http://localhost:8080/api/sales/top-raw-materials');
                const topRawMaterials = topRawMaterialsResponse.data.slice(0, 10); // Limit to top 10
                console.log('Top Raw Materials:', topRawMaterials);
        
                // Step 2: Fetch all raw material stocks
                const stockResponse = await axios.get('http://localhost:8080/api/rawMaterialStock');
                const allStocks = stockResponse.data;
                console.log('All Raw Material Stocks:', allStocks);
        
                // Step 3: Filter to get stocks of the top 10 raw materials
                const filteredStocks = topRawMaterials.map(material => {
                    const stock = allStocks.find(stock =>
                        stock.rawMaterial.materialName.toLowerCase() === material.rawMaterialName.toLowerCase()
                    );
                    return stock;
                }).filter(Boolean); // Remove any undefined values
        
                // Step 4: Extract data for the graph
                const materialNames = filteredStocks.map(stock => stock.rawMaterial.materialName);
                const currentQuantities = filteredStocks.map(stock => stock.quantity);
                const minQuantities = filteredStocks.map(stock => stock.minQuantity);
        
                // Step 5: Set chart data
                setRawMaterialData(prevData => ({
                    ...prevData,
                    series: [
                        {
                            name: 'Current Quantity',
                            data: currentQuantities,
                        },
                        {
                            name: 'Min Quantity',
                            data: minQuantities,
                        }
                    ],
                    options: {
                        ...prevData.options,
                        xaxis: {
                            ...prevData.options.xaxis,
                            categories: materialNames,  // Set categories dynamically
                        }
                    }
                }));
            } catch (error) {
                console.error("Error fetching raw material data:", error);
            }
        };
    
        

        fetchOrderStatus();
        fetchRawMaterialData();
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 5, mr: 5, bgcolor: theme.palette.background.default }}>
            <CssBaseline />


            <Grid container spacing={3}>
               


              

                <Grid item xs={12} md={12} sx={{ mt: 3 }}>
                    <Card
                        sx={{
                            mb: 3,
                            borderRadius: '12px',
                            border: '2px solid #D3D3D3',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            background: '#e1f5fe',
                            // '&:hover': {
                            //     transform: 'scale(1.05)',
                            //     boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                            // }
                        }}>
                        <CardContent>
                            <Typography variant="h6"><b>Raw Material Stock</b></Typography>
                            <ApexCharts options={rawMaterialData.options} series={rawMaterialData.series} type="bar" height={300} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6} sx={{ mt: 3 }}>
                    <Card
                        sx={{
                            mb: 3,
                            borderRadius: '12px',
                            border: '2px solid #D3D3D3',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            background: '#e1f5fe',
                            // '&:hover': {
                            //     transform: 'scale(1.05)',
                            //     boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                            // }
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6"><b>Raw Material Order Status from Last 2 Weeks</b></Typography>
                            <ApexCharts options={orderStatusData.options} series={orderStatusData.series} type="donut" height={300} />
                        </CardContent>

                    </Card>
                </Grid>
                <Grid item xs={12} md={6} sx={{ mt: 3 }}>
                    <Card
                        sx={{
                            mb: 3,
                            borderRadius: '12px',
                            border: '2px solid #D3D3D3',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            background: '#e1f5fe',
                            // '&:hover': {
                            //     transform: 'scale(1.05)',
                            //     boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                            // }
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6"><b>Order Status for Deliveries in Next 7 Days</b></Typography>
                            <ApexCharts options={deliveryStatusData.options} series={deliveryStatusData.series} type="donut" height={300} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                    <Card
                        sx={{
                            mb: 3,
                            mt: 3,
                            border: '2px solid #D3D3D3',
                            borderRadius: '12px',
                            height: 380, // Fixed height for the card
                            background: '#e1f5fe',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            // '&:hover': {
                            //     transform: 'scale(1.02)',
                            //     boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                            // }
                        }}
                    >
                        <CardContent sx={{ padding: '16px' }}>
                            <Typography variant="h6">
                                <b>Pending Raw Material Orders Older than 2 Weeks: {pendingOrders.length}</b>
                            </Typography>
                            <TableContainer component={Paper} sx={{ mt: 2, background: '#e1f5fe', }}>
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


                <Grid item xs={12} sm={6} md={6}>
                    <Card
                        sx={{
                            mb: 3,
                            mt: 3,
                            border: '2px solid #D3D3D3',
                            borderRadius: '12px',
                            height: 380,
                            background: '#e1f5fe',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            // '&:hover': {
                            //     transform: 'scale(1.02)',
                            //     boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                            // }
                        }}
                    >
                        <CardContent sx={{ padding: '16px' }}>
                            <Typography variant="h6"><b>Orders to be Delivered in Next 7 Days: {deliveryOrders.length}</b></Typography>
                            <TableContainer component={Paper} sx={{ mt: 2, background: '#e1f5fe', }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Customer Name</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Delivery Date</TableCell>
                                            <TableCell>Product Name</TableCell>
                                            <TableCell>Quantity</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {deliveryOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                                            <TableRow key={order.saleId}>
                                                <TableCell>{order.customerName}</TableCell>
                                                <TableCell>{order.orderStatus}</TableCell>
                                                <TableCell>{dayjs(order.orderDeliveryDate).format('YYYY-MM-DD')}</TableCell>
                                                <TableCell>{order.products.map(product => product.prodName).join(", ")}</TableCell>
                                                <TableCell>{order.quantities.join(", ")}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <TablePagination
                                    rowsPerPageOptions={[3]}
                                    component="div"
                                    count={deliveryOrders.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default NewHome;
