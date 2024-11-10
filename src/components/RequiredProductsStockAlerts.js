import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Alert } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

const RequiredProductsStockAlerts = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch product and raw material stock data
                const productName = searchParams.get('productName'); // Replace this with dynamic product selection if necessary
                const productResponse = await axios.get(`/api/products/name/${encodeURIComponent(productName)}`);
                const rawMaterialStockResponse = await axios.get('/api/rawMaterialStock');

                const product = productResponse.data;
                const rawMaterialStock = rawMaterialStockResponse.data;

                // Dictionary to hold total required quantities of raw materials for this specific product
                const requiredRawMaterials = {};

                // Assuming the requiredQuantity is dynamic, you can hard-code it for now for testing
                const requiredQuantity = searchParams.get('requiredQuantity'); // Example: 15 units of Wooden Dining Table

                // Loop through the raw materials needed for the specific product
                product.rawMaterials.forEach(material => {
                    const rawMaterialName = material.rawMaterial.materialName;
                    const quantityNeededPerUnit = material.rawMaterialQuantity; // How much of the material is needed per unit of product
                    const totalQuantityNeeded = requiredQuantity * quantityNeededPerUnit; // Total material required for the total units

                    // If material is not already in the dictionary, initialize it
                    if (!requiredRawMaterials[rawMaterialName]) {
                        requiredRawMaterials[rawMaterialName] = 0;
                    }
                    requiredRawMaterials[rawMaterialName] += totalQuantityNeeded;
                });

                // Array to hold any stock alerts that need to be shown
                const stockAlerts = [];

                // Compare required raw materials with available stock
                Object.keys(requiredRawMaterials).forEach(materialName => {
                    const totalRequired = requiredRawMaterials[materialName];
                    const stockItem = rawMaterialStock.find(stock => stock.rawMaterial.materialName === materialName);
                    const availableQuantity = stockItem ? stockItem.quantity : 0;

                    // If available stock is less than required stock, show an alert
                    if (availableQuantity < totalRequired) {
                        stockAlerts.push(
                            `Insufficient stock for ${materialName}: Required ${totalRequired} units, but only ${availableQuantity} units are available.`
                        );
                    }
                });

                // Set alerts to be displayed in the UI
                setAlerts(stockAlerts);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [searchParams]);

    return (
        <Card sx={{ m: 3, p: 2 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Required Products Stock Alerts for <strong>{searchParams.get('productName')}</strong>
                </Typography>
                {alerts.length > 0 ? (
                    alerts.map((alert, index) => (
                        <Alert severity="warning" key={index} sx={{ mb: 1 }}>
                            {alert}
                        </Alert>
                    ))
                ) : (
                    <Typography>No stock issues detected for required products.</Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default RequiredProductsStockAlerts;
