import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Grid, Table, TableHead, Paper, TableContainer, TableCell, TableRow, TableBody, CssBaseline, useTheme, Card, CardContent, Typography, TablePagination } from '@mui/material';
import ApexCharts from 'react-apexcharts';
import axios from 'axios';
import dayjs from 'dayjs';
import useMediaQuery from '@mui/material/useMediaQuery';

const NewHome = ({ userDetails }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    //Table Pagination
    const [page, setPage] = useState(0); // Current page
    const [rowsPerPage, setRowsPerPage] = useState(3); // Rows per page

    const [deliveryOrders, setDeliveryOrders] = useState([]);
    const [overdueOrders, setOverdueOrders] = useState([]);
    const [next14DaysOrderStatusData, setNext14DaysOrderStatusData] = useState({
        series: [0, 0, 0],
        options: {
            chart: {
                type: 'donut',
            },
            legend: {
                show: true,
                onItemHover: {
                    highlightDataSeries: false
                },
            },
            labels: ['Pending', 'Shipped', 'Delivered'],
            colors: ['#FF4560', '#FFA500', '#00E396'],
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
                                    if (w?.globals?.seriesTotals) {
                                        const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                        console.log({ total })
                                        return total ? total.toString() : "0";
                                    }
                                    return "0";
                                }
                            }
                        }
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        console.log({ val })
                        return val?.toString() ?? "0";
                    }
                }
            },

            responsive: [{
                breakpoint: 600,
                options: {
                    chart: {
                        width: isMobile ? '100%' : '100%',
                    },
                    legend: {
                        position: isMobile ? 'bottom' : 'top',

                    }
                }
            }],
        }
    });

    const [last2WeeksOrderStatusData, setLast2WeeksOrderStatusData] = useState({
        series: [0, 0, 0],
        options: {
            chart: {
                type: 'donut',
            },
            labels: ['Pending', 'Shipped', 'Delivered'],
            colors: ['#FF4560', '#FFA500', '#00E396'],
            legend: {
                show: true,
                onItemHover: {
                    highlightDataSeries: false
                },
            },
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
                                    if (w?.globals?.seriesTotals) {
                                        const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);

                                        return total ? total.toString() : "0";
                                    }
                                    return "0";
                                }
                            }
                        }
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        console.log({ val })
                        return val?.toString() ?? "0";
                    }
                }
            },

            responsive: [{
                breakpoint: 600,
                options: {
                    chart: {
                        width: isMobile ? '100%' : '100%',
                    },
                    legend: {
                        position: isMobile ? 'bottom' : 'top',
                    }
                }
            }],
        }
    });

    const [rawMaterialData, setRawMaterialData] = useState({
        series: [
            {
                name: 'Current Quantity',
                data: [],
                color: '#90caf9'
            },
            {
                name: 'Min Quantity',
                data: [],
                color: '#FF4560'
            }
        ],
        options: {
            chart: {
                type: 'bar',
                zoom: {
                    enabled: true,
                    type: 'x',
                    autoScaleYaxis: true
                },
                toolbar: {
                    show: !isMobile,
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
                    columnWidth: '50%',
                    endingShape: 'rounded'
                }
            },
            xaxis: {
                categories: [],
                tickPlacement: 'on',
                title: {
                    text: 'Raw Materials'
                },
                labels: {
                    rotate: -45,
                    style: {
                        fontSize: '12px',
                    }
                },
                scrollbar: {
                    enabled: true,
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
            colors: ['#00BFFF', '#FF4560'],
            tooltip: {
                shared: false,
                intersect: true,
                y: {
                    formatter: function (value, { dataPointIndex }) {
                        const minQuantity = rawMaterialData.series[1]?.data?.[dataPointIndex] ?? 0;
                        return value !== undefined && value !== null ? (value < minQuantity ? `${value} (Low)` : `${value} units`) : "0 units";
                    }
                }
            },
            legend: {
                show: true,
                position: 'top',
                horizontalAlign: 'center',
            },
            grid: {
                show: true,
                borderColor: '#e7e7e7',
            }
        }
    });

    const fetchSalesData = async () => {
        try {
            const response = await axios.get('/api/sales');
            const sales = response.data;

            const today = dayjs().startOf('day');
            const oneWeekFromToday = dayjs().add(7, 'days').endOf('day');
            const twoWeeksFromToday = dayjs().add(14, 'days').endOf('day');

            const deliverySales = sales.filter(sale =>
                dayjs(sale.orderDeliveryDate).isBefore(oneWeekFromToday) &&
                dayjs(sale.orderDeliveryDate).isAfter(today) &&
                sale.orderDecision?.toLowerCase() === "confirmed"
            );

            const overdueSales = sales.filter(sale =>
                dayjs(sale.orderDeliveryDate).isBefore(today) &&
                sale.orderDecision?.toLowerCase() === "confirmed"
            );

            const next14DaysSales = sales.filter(sale =>
                dayjs(sale.orderDeliveryDate).isBefore(twoWeeksFromToday) &&
                dayjs(sale.orderDeliveryDate).isAfter(today) &&
                sale.orderDecision?.toLowerCase() === "confirmed"
            );

            const next14DaysPendingCount = next14DaysSales.filter(order => order.orderStatus?.trim().toLowerCase() === 'pending').length;
            const next14DaysShippedCount = next14DaysSales.filter(order => order.orderStatus?.trim().toLowerCase() === 'shipped').length;
            const next14DaysDeliveredCount = next14DaysSales.filter(order => order.orderStatus?.trim().toLowerCase() === 'delivered').length;

            setNext14DaysOrderStatusData({
                series: [
                    next14DaysPendingCount,
                    next14DaysShippedCount,
                    next14DaysDeliveredCount
                ],
                options: {
                    ...next14DaysOrderStatusData.options
                }
            });

            setDeliveryOrders(deliverySales);
            setOverdueOrders(overdueSales);
        } catch (error) {
            console.error("Error fetching sales data:", error);
        }
    };

    const fetchLast2WeeksOrdersData = async () => {
        try {
            const response = await axios.get('/api/orders');
            const orders = response.data;
            const twoWeeksAgo = dayjs().subtract(14, 'days').startOf('day');

            const last2WeeksOrders = orders.filter(order =>
                dayjs(order.createdDate).isAfter(twoWeeksAgo)
            );

            const pendingCount = last2WeeksOrders.filter(order => order.status?.trim().toLowerCase() === 'pending').length;
            const shippedCount = last2WeeksOrders.filter(order => order.status?.trim().toLowerCase() === 'shipped').length;
            const deliveredCount = last2WeeksOrders.filter(order => order.status?.trim().toLowerCase() === 'delivered').length;

            setLast2WeeksOrderStatusData({
                series: [
                    pendingCount,
                    shippedCount,
                    deliveredCount
                ],
                options: {
                    ...last2WeeksOrderStatusData.options
                }
            });
        } catch (error) {
            console.error("Error fetching last 2 weeks orders data:", error);
        }
    };

    const fetchRawMaterialData = async () => {
        try {
            const topRawMaterialsResponse = await axios.get('/api/sales/top-raw-materials');
            const topRawMaterials = topRawMaterialsResponse.data.slice(0, 10);
            console.log('Top Raw Materials:', topRawMaterials);

            const stockResponse = await axios.get('/api/rawMaterialStock');
            const allStocks = stockResponse.data;
            console.log('All Raw Material Stocks:', allStocks);

            const filteredStocks = topRawMaterials.map(material => {
                const stock = allStocks.find(stock =>
                    stock.rawMaterial?.materialName?.toLowerCase() === material.rawMaterialName?.toLowerCase()
                );
                return stock;
            }).filter(Boolean);

            if (filteredStocks.length === 0) {
                console.warn('No matching raw materials found for the top raw materials list.');
            }

            const materialNames = filteredStocks.map(stock => stock.rawMaterial?.materialName ?? "Unknown Material");
            const currentQuantities = filteredStocks.map(stock => stock.quantity ?? 0);
            const minQuantities = filteredStocks.map(stock => stock.minQuantity ?? 0);

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
                        categories: materialNames,
                    }
                }
            }));
        } catch (error) {
            console.error("Error fetching raw material data:", error);
        }
    };

    useEffect(() => {
        fetchSalesData();
        fetchLast2WeeksOrdersData();
        fetchRawMaterialData();
    }, []);
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page when rows per page changes
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 5, mr: 5, bgcolor: theme.palette.background.default }}>
            <CssBaseline />
            <Grid container spacing={3}>

                <Grid item xs={12} md={12} sx={{ mt: isMobile ? 1 : 3 }}>

                    <Card
                        sx={{
                            mb: isMobile ? 2 : 3,
                            mt: isMobile ? 2 : 3,
                            borderRadius: '12px',
                            border: '2px solid #D3D3D3',
                            height: isMobile ? 'auto' : 300,
                            background: '#e1f5fe',
                            padding: isMobile ? '10px' : '16px',
                        }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}><b>Raw Material Stock</b></Typography>


                            <Box
                                sx={{
                                    overflowX: isMobile ? 'auto' : 'visible',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <ApexCharts options={rawMaterialData.options} series={rawMaterialData.series} type="bar" height={300} />
                            </Box>


                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6} sx={{ mt: isMobile ? 1 : 3 }}>
                    <Card
                        sx={{
                            mb: isMobile ? 2 : 3,
                            mt: isMobile ? 2 : 3,
                            height: isMobile ? 'auto' : 300,
                            borderRadius: '12px',
                            border: '2px solid #D3D3D3',
                            background: '#e1f5fe',
                            padding: isMobile ? '10px' : '16px',
                        }}>
                        <CardContent>

                            <Typography variant="h6" sx={{ fontSize: isMobile ? '1rem' : '1.25 rem' }}><b>Raw Material Order Status from Last 2 Weeks</b></Typography>
                            <ApexCharts options={last2WeeksOrderStatusData.options} series={last2WeeksOrderStatusData.series} type="donut" height={300} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={6} sx={{ mt: isMobile ? 1 : 3 }}>
                    <Card
                        sx={{
                            mb: isMobile ? 2 : 3,
                            mt: isMobile ? 2 : 3,
                            height: isMobile ? 'auto' : 300,
                            border: '2px solid #D3D3D3',
                            borderRadius: '12px',
                            height: 380,
                            background: '#e1f5fe',
                            padding: isMobile ? '10px' : '16px',
                        }}>
                        <CardContent sx={{ padding: '16px' }}>
                            <Typography variant="h6" sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}><b>Orders to be Delivered in Next 7 Days: {deliveryOrders.length}</b></Typography>
                            <Box sx={{ overflowX: isMobile ? 'auto' : 'visible' }}>

                                <TableContainer component={Paper} sx={{ mt: 2, background: '#e1f5fe', }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><strong>Customer Name</strong></TableCell>
                                                <TableCell><b>Status</b></TableCell>
                                                <TableCell><b>Delivery Date</b></TableCell>
                                                <TableCell><b>Product Name</b></TableCell>
                                                <TableCell><b>Quantity</b></TableCell>
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
                                        count={deliveryOrders.length} // For Delivery Orders Table
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                    />

                                </TableContainer>
                            </Box>
                        </CardContent>
                    </Card>

                </Grid>
                <Grid item xs={12} sm={6} md={6} sx={{ mt: isMobile ? 1 : 3 }}>
                    <Card
                        sx={{
                            mb: isMobile ? 2 : 3,
                            mt: isMobile ? 2 : 3,
                            border: '2px solid #D3D3D3',
                            borderRadius: '12px',
                            height: isMobile ? 'auto' : 380,
                            background: '#e1f5fe',
                            padding: isMobile ? '10px' : '16px',

                        }}>
                        <CardContent sx={{ padding: '16px' }}>
                            {console.log({ next14DaysOrderStatusData })}

                            <Typography variant="h6" sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}><b>Order Status for Deliveries in Next 14 Days</b></Typography>
                            <ApexCharts options={next14DaysOrderStatusData.options} series={next14DaysOrderStatusData.series} type="donut" height={300} />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={6} sx={{ mt: isMobile ? 1 : 3 }}>
                    <Card
                        sx={{
                            mb: isMobile ? 2 : 3,
                            mt: isMobile ? 2 : 3,
                            border: '2px solid #D3D3D3',
                            borderRadius: '12px',
                            height: isMobile ? 'auto' : 380,
                            background: '#FF5733',
                            padding: isMobile ? '10px' : '16px'
                        }}>
                        <CardContent sx={{ padding: '16px' }}>

                            <Typography variant="h6" sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} color="white">
                                <b>Overdue Orders: {overdueOrders.length}</b>
                            </Typography>
                            <Box sx={{ overflowX: isMobile ? 'auto' : 'visible' }}>

                                <TableContainer component={Paper} sx={{ mt: 2, background: '#FFCCCB' }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><strong>Customer Name</strong></TableCell>
                                                <TableCell><strong>Status</strong></TableCell>
                                                <TableCell><strong>Delivery Date</strong></TableCell>
                                                <TableCell><strong>Product Name</strong></TableCell>
                                                <TableCell><strong>Quantity</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {overdueOrders.map((order) => (
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
                                </TableContainer>
                            </Box>
                        </CardContent>
                    </Card>

                </Grid>
            </Grid>
        </Box>
    );
};

export default NewHome;
