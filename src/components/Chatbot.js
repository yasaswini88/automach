import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import { fetchChatbotResponse } from './chatbotFetching';
import axios from 'axios';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Person4Icon from '@mui/icons-material/Person4';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';

const Chatbot = ({ userDetails }) => {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { bot: `Hello, ${userDetails?.firstName} ${userDetails?.lastName}, how can I assist you today?` },
  ]);
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [typing, setTyping] = useState(false); // Typing indicator state

  const chatBotImageUrl = 'https://botnation.ai/site/wp-content/uploads/2022/02/meilleur-chatbot.jpg';


  // Function to handle API calls based on URL
  const handleApiCall = async (url, queryContext = {}) => {
    try {
      let response;

      switch (true) {
        // Raw Materials
        case url === '/api/rawmaterials':
          response = await axios.get(url);
          return response.data.map((material) => material.materialName || 'Unknown').join(', ');

        case url.includes('/api/rawMaterialStock/material/'):
          const materialName = url.split('/').pop();
          response = await axios.get(url);
          const queryLowerRawmaterial = queryContext.query.toLowerCase();
          if (queryLowerRawmaterial.includes('min quantity')) {
            return `Material: ${response.data.rawMaterial.materialName}, Min Quantity: ${response.data.minQuantity}`;
          } else if (queryLowerRawmaterial.includes('current quantity')) {
            return `Material: ${response.data.rawMaterial.materialName}, Current Quantity: ${response.data.quantity}`;
          } else {
            return `Material: ${response.data.rawMaterial.materialName}, Min Quantity: ${response.data.minQuantity}, Current Quantity: ${response.data.quantity}`;
          }

        // Suppliers
        case url === '/api/suppliers':
          response = await axios.get(url);
          return response.data.map((supplier) => supplier.name || 'Unknown').join(', ');

        case url.includes('/api/suppliers/supplierName/'):
          const supplierName = url.split('/').pop();
          response = await axios.get(url);
          if (queryContext.query.toLowerCase().includes('address')) {
            return `Supplier: ${response.data.name}, Address: ${response.data.addressLine1}, ${response.data.addressLine2}, ${response.data.city}, ${response.data.state}, ${response.data.postalCode}`;
          } else {
            return `Supplier: ${response.data.name}, Email: ${response.data.email}, Phone: ${response.data.phone}`;
          }

        // Products
        case url === '/api/products':
          response = await axios.get(url);
          return response.data.map((product) => product.prodName || 'Unknown').join(', ');

        case url.includes('/api/products/name/'):
          const productName = url.split('/').pop();
          response = await axios.get(url);
          const productDetails = {
            name: response.data.prodName,
            price: response.data.price,
            category: response.data.category.name,
            tags: response.data.tags.map(tag => tag.name).join(', '),
            rawMaterials: response.data.rawMaterials.map(mat => `${mat.rawMaterial.materialName} (${mat.rawMaterialQuantity})`).join(', ')
          };
          const queryLower = queryContext.query.toLowerCase();
          if (queryLower.includes('price')) {
            return `Product: ${productDetails.name}, Price: ${productDetails.price}`;
          } else if (queryLower.includes('category')) {
            return `Product: ${productDetails.name}, Category: ${productDetails.category}`;
          } else if (queryLower.includes('tags')) {
            return `Product: ${productDetails.name}, Tags: ${productDetails.tags}`;
          } else if (queryLower.includes('raw materials')) {
            return `Product: ${productDetails.name}, Raw Materials: ${productDetails.rawMaterials}`;
          } else {
            return `Product: ${productDetails.name}, Price: ${productDetails.price}, Category: ${productDetails.category}, Tags: ${productDetails.tags}, Raw Materials: ${productDetails.rawMaterials}`;
          }

        // Most Commonly Used Raw Materials
        case url === '/api/sales/top-raw-materials':
          response = await axios.get(url);
          const topMaterials = response.data.rawMaterials.map((material) => material.rawMaterial.materialName || 'Unknown').join(', ');
          return `Most commonly used raw materials: ${topMaterials}.`;

        // To check quantity of the product
        case url.includes('/api/inventory/product/'):
          // case url=== '/api/inventory/product/${encodeURIComponent(productName)}/quantity' :
          //  case url ="/api/inventory/product/${encodeURIComponent(productName)}/quantity":
          response = await axios.get(url);
          if (!response.data || response.data.length === 0) {
            return `No inventory data found for ${queryContext.prodName}.`;
          }
          const inventoryData = response.data[0]; // Assume it returns an array with one inventory item
          const inventoryMessage = ` Available Quantity: ${inventoryData.quantity}, Blocked Quantity: ${inventoryData.blockedQuantity}, Required Quantity: ${inventoryData.requiredQuantity}`;
          return inventoryMessage;

        //To check the order status of raw material with supplier name 
        // New case for Raw Material Order Status
        case url.includes('/api/orders/'):
          response = await axios.get(url);
          if (!response.data || response.data.length === 0) {
            return `No order data found for ${queryContext.rawMaterialName} with ${queryContext.supplierName}.`;
          }
          const orderData = response.data[0]; 
          const orderMessage = `The order status of ${orderData.rawMaterialName} with ${orderData.supplierName} is "${orderData.status}" with a quantity of ${orderData.rawMaterialQuantity} units.`;
          return orderMessage;

        

        case url.includes('/api/orders') && url.includes('?status='):
          response = await axios.get(url);
          if (!response.data || response.data.length === 0) {
            return `No orders found with status ${queryContext.orderStatus}.`;
          }
          const ordersMessage = response.data.map((order, index) => {
            return `${index + 1}. ${order.rawMaterialName}, Quantity: ${order.rawMaterialQuantity} units, Supplier: ${order.supplierName}`;
          }).join(" | ");
          return `Raw Materials with ${queryContext.orderStatus} order status are: ${ordersMessage}.`;


        // Low Stock Alerts for Commonly Used Raw Materials
        case url === '/api/sales/top-raw-materials/low-stock':
          const topRawMaterialsResponse = await axios.get('/api/sales/top-raw-materials');
          const topRawMaterials = topRawMaterialsResponse.data;
          const stockResponse = await axios.get('/api/rawMaterialStock');
          const allStocks = stockResponse.data;
          const lowStockAlerts = topRawMaterials.reduce((acc, material) => {
            const stock = allStocks.find(stock =>
              stock.rawMaterial.materialName.toLowerCase() === material.rawMaterialName.toLowerCase()
            );
            if (stock && stock.quantity < stock.minQuantity) {
              acc.push(`${material.rawMaterialName} has ${stock.quantity} units, below minimum of ${stock.minQuantity} units.`);
            }
            return acc;
          }, []);
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

  const handleSendMessage = async () => {
    if (!userMessage) return;

    setLoading(true);
    setTyping(true);
    setError(null);

    try {
      const response = await fetchChatbotResponse(userMessage);
      console.log('Chatbot response:', response);


      const urlMatch = response.match(/"apiURL"\s*:\s*"([^"]+)"/);
      const url = urlMatch ? urlMatch[1] : null;

      const rawMaterialMatch = userMessage.match(/quantity of ([a-zA-Z]+)/i);
      const rawMaterial = rawMaterialMatch ? rawMaterialMatch[1].toLowerCase() : 'wood';


      const supplierMatch = userMessage.match(/address of ([a-zA-Z\s]+)/i);
      const supplierName = supplierMatch ? supplierMatch[1].toLowerCase() : null;

      const productMatch = userMessage.match(/price of ([a-zA-Z\s]+)/i);
      const productName = productMatch ? productMatch[1].toLowerCase() : null;

      const productQuantity = userMessage.match(/quantity of ([a-zA-Z\s]+)/i);
      const prodName = productQuantity ? productQuantity[1] : null;



      const orderStatusMatch = response.match(/"orderStatus"\s*:\s*"([^"]+)"/);
      const orderStatus = orderStatusMatch ? orderStatusMatch[1] : null;

      const queryContext = {
        rawMaterial: rawMaterial,
        supplierName: supplierName,
        productName: productName,
        prodName: prodName,
        orderStatus: orderStatus,
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
  sx={{
    maxWidth: 900,
    margin: '0 auto',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  }}
>
  {/* Icon in Top Right Corner */}
  <Box
    sx={{
      position: 'absolute',
      top: 16,
      left: 16,
    }}
  >
    <AutoAwesomeIcon
      sx={{
        fontSize: 40,
        color: "#388e3c"
      }}
    />
  </Box>

  {/* Chatbot Image in Center */}
  <img
    src="https://botnation.ai/site/wp-content/uploads/2022/02/meilleur-chatbot.jpg"
    alt="Chatbot Icon"
    style={{ width: '160px', height: '100px', marginBottom: '10px' }} // Increase image size
  />

  {/* Prompt Text */}
  <Typography variant="h6" sx={{ marginBottom: 4, color: "#388e3c" }}>
    What do you want to know about Automach?
  </Typography>

  {/* Chat History */}
  <Paper
    elevation={3}
    sx={{
      width: '100%',
      maxHeight: 400,
      overflowY: 'auto',
      padding: 0,
      marginBottom: 2,
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
    }}
  >
    {chatHistory.map((chat, index) => (
      <Box key={index} sx={{ marginBottom: 2 }}>
        {/* User Message */}
        {chat.user && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 1,
              marginBottom: 1,
            }}
          >
            <Person4Icon sx={{ color: '#1976d2' }} />
            <Box
              sx={{
                maxWidth: '75%',
                padding: 1.5,
                borderRadius: 3,
                backgroundColor: '#4aedc4',
                color: '#fff',
                textAlign: 'right',
              }}
            >
              <Typography variant="body1">{chat.user}</Typography>
            </Box>
          </Box>
        )}
        {/* Bot Message */}
        {chat.bot && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <SmartToyIcon sx={{ color: '#555' }} />
            <Box
              sx={{
                maxWidth: '75%',
                padding: 1.5,
                borderRadius: 3,
                backgroundColor: '#e0e0e0',
                color: '#000',
                textAlign: 'left',
              }}
            >
              <Typography variant="body1">{chat.bot}</Typography>
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
      disabled={loading}
      sx={{
        '& .MuiOutlinedInput-root': {
          '&.Mui-focused fieldset': {
            borderColor: '#388e3c', 
          },
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: '#388e3c', 
        },
      }}
    />
    <IconButton
      color="primary"
      onClick={handleSendMessage}
      disabled={loading || !userMessage}
      sx={{
        '&:hover': {
          backgroundColor: '#2e7d32', 
        },
        color: '#388e3c', 
        maxWidth: "75px"
      }}
    >
      {loading ? <CircularProgress size={24} /> : <SendIcon />} 
    </IconButton>
  </Box>
</Box>



  );
};

export default Chatbot;
