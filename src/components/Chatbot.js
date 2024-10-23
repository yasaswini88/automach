import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import { fetchChatbotResponse } from './chatbotFetching'; // Import the fetching function
import axios from 'axios';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Person4Icon from '@mui/icons-material/Person4';

const Chatbot = ({ userDetails }) => {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { bot: `Hello, ${userDetails?.firstName} ${userDetails?.lastName}, how can I assist you today?` },
  ]);
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [typing, setTyping] = useState(false); // Typing indicator state

  // Function to handle API calls based on URL
  const handleApiCall = async (url, queryContext = {}) => {
    try {
      let response;

      // Use switch-case to handle different URL patterns
      switch (true) {
        // Raw Materials
        case url === 'http://localhost:8080/api/rawmaterials':
          response = await axios.get(url);
          return response.data.map((material) => material.materialName || 'Unknown').join(', ');

        case url.includes('/api/rawMaterialStock/material/'):
          // Extract the material name from the URL
          const materialName = url.split('/').pop();

          // Make the API call
          response = await axios.get(url);

          // Check the user's query to determine whether it's for 'min quantity' or 'current quantity'
          const queryLowerRawmaterial = queryContext.query.toLowerCase();

          if (queryLowerRawmaterial.includes('min quantity')) {
            return `Material: ${response.data.rawMaterial.materialName}, Min Quantity: ${response.data.minQuantity}`;
          } else if (queryLowerRawmaterial.includes('current quantity')) {
            return `Material: ${response.data.rawMaterial.materialName}, Current Quantity: ${response.data.quantity}`;
          } else {
            // If no specific quantity type is requested, return both
            return `Material: ${response.data.rawMaterial.materialName}, Min Quantity: ${response.data.minQuantity}, Current Quantity: ${response.data.quantity}`;
          }

        // Suppliers
        case url === 'http://localhost:8080/api/suppliers':
          // Fetch the list of suppliers
          response = await axios.get(url);
          return response.data.map((supplier) => supplier.name || 'Unknown').join(', ');

        case url.includes('/api/suppliers/supplierName/'):
          // Extract the supplier name from the URL
          const supplierName = url.split('/').pop();

          // Fetch supplier details by name
          response = await axios.get(url);

          // Check if user is asking for a specific supplier's address
          if (queryContext.query.toLowerCase().includes('address')) {
            return `Supplier: ${response.data.name}, Address: ${response.data.addressLine1}, ${response.data.addressLine2}, ${response.data.city}, ${response.data.state}, ${response.data.postalCode}`;
          } else {
            // Return general details if no specific field is asked
            return `Supplier: ${response.data.name}, Email: ${response.data.email}, Phone: ${response.data.phone}`;
          }
        case url === 'http://localhost:8080/api/products':
          // Fetch the list of products
          response = await axios.get(url);
          return response.data.map((product) => product.prodName || 'Unknown').join(', ');

        // Case for fetching product details by name
        case url.includes('/api/products/name/'):
          // Extract the product name from the URL
          const productName = url.split('/').pop();

          // Fetch product details by name
          response = await axios.get(url);

          // Extract details from the response
          const productDetails = {
            name: response.data.prodName,
            price: response.data.price,
            category: response.data.category.name,
            tags: response.data.tags.map(tag => tag.name).join(', '),
            rawMaterials: response.data.rawMaterials.map(mat => `${mat.rawMaterial.materialName} (${mat.rawMaterialQuantity})`).join(', ')
          };

          // Check the user's query context for specific field requests
          const queryLower = queryContext.query.toLowerCase();

          // Return specific product details based on the user's query
          if (queryLower.includes('price')) {
            return `Product: ${productDetails.name}, Price: ${productDetails.price}`;
          } else if (queryLower.includes('category')) {
            return `Product: ${productDetails.name}, Category: ${productDetails.category}`;
          } else if (queryLower.includes('tags')) {
            return `Product: ${productDetails.name}, Tags: ${productDetails.tags}`;
          } else if (queryLower.includes('raw materials')) {
            return `Product: ${productDetails.name}, Raw Materials: ${productDetails.rawMaterials}`;
          } else {
            // Default: Return all details if no specific field is requested
            return `Product: ${productDetails.name}, Price: ${productDetails.price}, Category: ${productDetails.category}, Tags: ${productDetails.tags}, Raw Materials: ${productDetails.rawMaterials}`;
          }

          const handleApiCall = async (url, queryContext = {}) => {
            try {
                let response;
        
                switch (true) {
                    // Case for most commonly used raw materials
                    case url === 'http://localhost:8080/api/sales/top-raw-materials':
                        response = await axios.get(url);
                        console.log(response)
                        // Extract raw material names from the response data
                        const topMaterials = response.data.rawMaterials.map((material) => material.rawMaterial.materialName || 'Unknown').join(', ');
                        return `Most commonly used raw materials: ${topMaterials}.`;
        
                    // Case for low stock alerts among commonly used raw materials
                    case url === 'http://localhost:8080/api/sales/top-raw-materials/low-stock':
                        // Step 1: Fetch the most commonly used raw materials
                        const topRawMaterialsResponse = await axios.get('http://localhost:8080/api/sales/top-raw-materials');
                        const topRawMaterials = topRawMaterialsResponse.data;
        
                        // Step 2: Fetch all raw material stocks
                        const stockResponse = await axios.get('http://localhost:8080/api/rawMaterialStock');
                        const allStocks = stockResponse.data;
        
                        // Step 3: Filter to get stocks of the top raw materials with low quantities
                        const lowStockAlerts = topRawMaterials.reduce((acc, material) => {
                            const stock = allStocks.find(stock => 
                                stock.rawMaterial.materialName.toLowerCase() === material.rawMaterialName.toLowerCase()
                            );
        
                            if (stock && stock.quantity < stock.minQuantity) {
                                acc.push(`${material.rawMaterialName} has ${stock.quantity} units, below minimum of ${stock.minQuantity} units.`);
                            }
                            return acc;
                        }, []);
        
                        // Format the response
                        return lowStockAlerts.length 
                            ? `Low stock alerts for commonly used raw materials: ${lowStockAlerts.join('; ')}.` 
                            : 'No low stock alerts for the commonly used raw materials.';
        
                    default:
                        return 'No valid API URL provided.';
                }
            } catch (error) {
                console.error(`Error fetching data from ${url}:`, error);
                return 'Sorry, there was an issue fetching the data. Please try again later.';
            }
        };
        

        default:
          // If the URL doesn't match any of the cases, return an error message
          return 'No valid API URL provided.';
      }
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      return 'Sorry, there was an issue fetching the data. Please try again later.';
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage) return;

    setLoading(true);
    setTyping(true);
    setError(null);

    try {
      const response = await fetchChatbotResponse(userMessage);
      console.log('Chatbot response:', response);

      // Extract URL from the chatbot response (more robust regex to handle URL within axios.get())
      const urlMatch = response.match(/axios\.get\('([^']+)'\)/);
      const url = urlMatch ? urlMatch[1] : null;

      // Extract raw material name or supplier name from the user's query (fallback to 'wood' for raw materials)
      const rawMaterialMatch = userMessage.match(/quantity of ([a-zA-Z]+)/i);
      const rawMaterial = rawMaterialMatch ? rawMaterialMatch[1].toLowerCase() : 'wood'; // Default to 'wood'

      // Extract supplier name from user's query (if applicable)
      const supplierMatch = userMessage.match(/address of ([a-zA-Z\s]+)/i);
      const supplierName = supplierMatch ? supplierMatch[1].toLowerCase() : null;

      const productMatch = userMessage.match(/price of ([a-zA-Z\s]+)/i);
      const productName = productMatch ? productMatch[1].toLowerCase() : null;

      const queryContext = {
        rawMaterial: rawMaterial,
        supplierName: supplierName,
        productName: productName,
        query: userMessage.toLowerCase(),
      };

      if (url) {
        const apiData = await handleApiCall(url, queryContext);
        setChatHistory([...chatHistory, { user: userMessage, bot: `Fetched data: ${apiData}` }]);
      } else {
        setChatHistory([...chatHistory, { user: userMessage, bot: response }]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setTyping(false);
      setUserMessage('');
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ padding: 2, maxWidth: 600, margin: '0 auto' }}
    >
      {/* Chat History */}
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxHeight: 400,
          overflowY: 'auto',
          padding: 2,
          marginBottom: 2,
          backgroundColor: '#f9f9f9',
        }}
      >
        {chatHistory.map((chat, index) => (
          <Box key={index} sx={{ marginBottom: 2 }}>
            {/* User Message */}
            {chat.user && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start', // Align to the right for user messages
                  alignItems: 'center',
                  gap: 1, // Space between icon and text
                  marginBottom: 1,
                }}
              >
                {/* User Icon */}
                <Person4Icon sx={{ color: '#1976d2' }} /> {/* Adjust color for visibility */}

                <Box
                  sx={{
                    maxWidth: '75%',
                    padding: 1.5,
                    borderRadius: 3,
                    backgroundColor: '#1565c0', // Blue background for user messages
                    color: '#fff',
                    textAlign: 'right',
                  }}
                >
                  <Typography variant="body1">
                    {chat.user}
                  </Typography>
                </Box>
              </Box>
            )}
            {/* Bot Message */}
            {chat.bot && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end', // Align to the left for bot messages
                  alignItems: 'center',
                  gap: 1, // Space between icon and text
                }}
              >
                <SmartToyIcon sx={{ color: '#555' }} />
                <Box
                  sx={{
                    maxWidth: '75%',
                    padding: 1.5,
                    borderRadius: 3,
                    backgroundColor: '#e0e0e0', // Gray background for bot messages
                    color: '#000',
                    textAlign: 'left',
                  }}
                >
                  <Typography variant="body1">
                    {chat.bot}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        ))}

        {/* Typing Indicator */}
        {typing && (
          <Typography variant="body2" sx={{ textAlign: 'left', marginTop: 1 }}>
            <em>Bot is typing...</em>
          </Typography>
        )}
      </Paper>

      {/* Error Message */}
      {error && <Typography color="error" variant="body2">{error}</Typography>}

      {/* Input Field and Send Button */}
      <Box display="flex" width="100%" gap={2}>
        <TextField
          label="Type your message"
          variant="outlined"
          fullWidth
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          disabled={loading} // Disable input while loading
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage} disabled={loading || !userMessage}>
          {loading ? <CircularProgress size={24} /> : 'Send'}
        </Button>
      </Box>
    </Box>
  );
};

export default Chatbot;
