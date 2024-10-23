import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

const NotificationAlerts = () => {
    const [stockAlerts, setStockAlerts] = useState([]);

    useEffect(() => {
        const fetchTopRawMaterials = async () => {
            try {
                // Step 1: Fetch the most commonly used raw materials
                const topRawMaterialsResponse = await axios.get('http://localhost:8080/api/sales/top-raw-materials');
                const topRawMaterials = topRawMaterialsResponse.data;
                console.log('Top Raw Materials:', topRawMaterials);

                // Step 2: Fetch all raw material stocks
                const stockResponse = await axios.get('http://localhost:8080/api/rawMaterialStock');
                const allStocks = stockResponse.data;
                console.log('All Raw Material Stocks:', allStocks);

                // Step 3: Filter to get stocks of the top raw materials
                const alerts = topRawMaterials.reduce((acc, material) => {
                    // Compare top raw material name with stock raw material name
                    const stock = allStocks.find(stock => 
                        stock.rawMaterial.materialName.toLowerCase() === material.rawMaterialName.toLowerCase()
                    );

                    if (stock && stock.quantity < stock.minQuantity) {
                        acc.push(`Low stock alert: ${material.rawMaterialName} has ${stock.quantity} units, below minimum of ${stock.minQuantity} units.`);
                    }

                    return acc;
                }, []);

                setStockAlerts(alerts); // Store alert messages
            } catch (error) {
                console.error('Error fetching raw material stock or top materials:', error);
            }
        };

        fetchTopRawMaterials();
    }, []);

    return (
        <div>
            {stockAlerts.length > 0 && (
                <Card sx={{ mb: 3, p: 2, backgroundColor: '#ffe6e6', border: '2px solid #ff4d4d', borderRadius: '12px' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ color: '#ff4d4d' }}>
                            <b>Stock Alerts</b>
                        </Typography>
                        {stockAlerts.map((alert, index) => (
                            <Typography key={index} sx={{ color: '#ff4d4d', display: 'flex', alignItems: 'center' }}>
                                <ErrorIcon sx={{ mr: 1 }} /> {/* The alert icon */}
                                {alert}
                            </Typography>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default NotificationAlerts;
