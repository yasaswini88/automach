import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, TextField, IconButton, MenuItem, Select,
  Grid, Autocomplete, Chip, Typography, useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Snackbar, Alert } from '@mui/material';


const getTagColor = (tag) => {
  const key = tag.name?.toLowerCase();
  const tagColorMap = {};

  if (Object.keys(tagColorMap).indexOf(key) === -1) {
    const randomColor = ['#ADD8E6', '#FFB6C1', '#90EE90'][Math.floor(Math.random() * 3)];
    tagColorMap[key] = randomColor;
  }

  return tagColorMap[key];
}

const Products = () => {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [tagFilter, setTagFilter] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortedProducts, setSortedProducts] = useState([...products]);

  const [newProduct, setNewProduct] = useState({
    prodName: '',
    category: null,
    price: '', // Added price attribute
    tags: [],
    rawMaterials: [{ materialId: '', rawMaterialQuantity: '' }]
  });
  const [materialOptions, setMaterialOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (column) => {
    const isAsc = sortColumn === column && sortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);

    const sorted = [...products].sort((a, b) => {
      const aValue = a[column] || ''; // Handle cases where the value may be null or undefined
      const bValue = b[column] || '';

      if (newDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setSortedProducts(sorted);
  };

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
};


  useEffect(() => {
    axios.get('http://localhost:8080/api/rawmaterials')
      .then(response => {
        setMaterialOptions(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the raw materials!', error);
        setError('Error fetching raw materials');
      });
  }, []);


  useEffect(() => {
    let filteredProductsList = products;
    
    if (categoryFilter) {
      filteredProductsList = products.filter(prod => prod.category.name === categoryFilter.name);
    }

    if (tagFilter && tagFilter.length > 0) {
      filteredProductsList = filteredProductsList.filter(prod => {
        const prodTags = prod.tags.map(tag => {return tag.name.toLowerCase()});
        const filterTags = tagFilter.map(tag => {return tag.name.toLowerCase()});
        return prodTags.some((prodTag) => filterTags.indexOf(prodTag) > -1);
      });
    }

    if (searchQuery) {
      filteredProductsList = filteredProductsList.filter(prod => prod.prodName.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1);
    }

    setSortedProducts(filteredProductsList);
  }, [searchQuery, categoryFilter, tagFilter]);

  // useEffect(() => {
  //   axios.get('http://localhost:8080/api/products')
  //     .then(response => {
  //       setProducts(response.data);
  //       setLoading(false);
  //     })
  //     .catch(error => {
  //       console.error('There was an error fetching the products!', error);
  //       setError('Error fetching products');
  //       setLoading(false);
  //     });
  // }, []);

  useEffect(() => {
    axios.get('http://localhost:8080/api/products')
      .then(response => {
        setProducts(response.data);
        setLoading(false);
        setSortedProducts(response.data); // Also set sortedProducts here
      })
      .catch(error => {
        console.error('There was an error fetching the products!', error);
        setError('Error fetching products');
        setLoading(false);
      });
  }, []);


  useEffect(() => {
    axios.get('http://localhost:8080/api/categories')
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the categories!', error);
      });

    axios.get('http://localhost:8080/api/tags')
      .then(response => {
        setTags(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the tags!', error);
      });
  }, []);

  const fetchRawMaterials = async (prodId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/products/${prodId}/materials`);
      setRawMaterials(response.data);
      setSelectedProduct(prodId);
    } catch (error) {
      console.error('Error fetching raw materials:', error);
      setRawMaterials([]);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewProduct({
      prodName: '',
      category: null,
      tags: [],
      rawMaterials: [{ materialId: '', rawMaterialQuantity: '' }]
    });
  };



  const handleAddRawMaterial = () => {
    setNewProduct({ ...newProduct, rawMaterials: [...newProduct.rawMaterials, { materialId: '', rawMaterialQuantity: '' }] });
  };

  const handleRemoveRawMaterial = (index) => {
    const newRawMaterials = newProduct.rawMaterials.filter((_, i) => i !== index);
    setNewProduct({ ...newProduct, rawMaterials: newRawMaterials });
  };

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newRawMaterials = [...newProduct.rawMaterials];
    newRawMaterials[index][name] = value;
    setNewProduct({ ...newProduct, rawMaterials: newRawMaterials });
  };

  const handleAddProduct = () => {
    const rawMaterialQuantities = {};
    newProduct.rawMaterials.forEach((material) => {
      const rawMaterialId = material.materialId;
      if (rawMaterialId) {
        rawMaterialQuantities[rawMaterialId] = material.rawMaterialQuantity;
      }
    });

    const validTags = newProduct.tags.filter(tag => tag && tag.id != null);

    const payload = {
      product: {
        prodName: newProduct.prodName,
        category: newProduct.category,
        price: newProduct.price, // Include price in payload
        // tags: newProduct.tags.map(tag => ({ id: tag.id }))
        tags: validTags.map(tag => ({ id: tag.id }))
      },
      rawMaterialQuantities: rawMaterialQuantities
    };

    console.log('Payload being sent:', payload);

    axios.post('http://localhost:8080/api/products', payload)
      .then(response => {
        setProducts([...products, response.data]);
        setSnackbar({ open: true, message: 'Product created successfully!', severity: 'success' });
        handleClose();
      })
      .catch(error => {
        console.error('Error adding product:', error);
      });
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>{error}</Typography>;
  }

  // const filteredProducts = products.filter(product =>
  //   product.prodName.toLowerCase().includes(searchQuery.toLowerCase())
  // );
  // const filteredProducts = products.filter(product => {
  //   const categoryMatch = filteredCategory ? product.category?.id === filteredCategory.id : true;
  //   const tagsMatch = filteredTags.length > 0 ? filteredTags.every(tag => product.tags.some(pTag => pTag.id === tag.id)) : true;
  //   return product.prodName.toLowerCase().includes(searchQuery.toLowerCase()) && categoryMatch && tagsMatch;
  // });
  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const handleTagFilterChange = (event, newValue) => {
    setTagFilter(newValue);
  };

  const filteredProducts = products.filter(product => {
    return (
      (!categoryFilter || (product.category && product.category.id === categoryFilter.id)) &&
      (tagFilter.length === 0 || tagFilter.every(tag => product.tags.some(productTag => productTag.id === tag.id))) &&
      product.prodName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />


      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
      >
        <Toolbar />
        <Container>


          <Typography variant="h6" component="h4" mt={4} gutterBottom>
            Product List
          </Typography>
          <TextField
            fullWidth
            label="Search Products"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
          />
          {/* <Autocomplete
            options={categories}
            getOptionLabel={(option) => option.name}
            value={filteredCategory}
            onChange={(event, newValue) => setFilteredCategory(newValue)}
            renderInput={(params) => <TextField {...params} label="Filter by Category" />}
            sx={{ mb: 2 }}
          />
          <Autocomplete
            multiple
            options={tags}
            getOptionLabel={(option) => option.name}
            value={filteredTags}
            onChange={(event, newValue) => setFilteredTags(newValue)}
            renderInput={(params) => <TextField {...params} label="Filter by Tags" />}
            sx={{ mb: 2 }}
          /> */}
          <Grid item xs={4} style={{ marginBottom: '16px' }}>
            <Select
              fullWidth
              value={categoryFilter || ''}
              onChange={handleCategoryFilterChange}
              displayEmpty
            >
              <MenuItem value="">
                <em>All Categories</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={4} style={{ marginBottom: '16px' }}>
            <Autocomplete
              multiple
              options={tags}
              getOptionLabel={(option) => option.name}
              value={tagFilter}
              onChange={handleTagFilterChange}
              renderInput={(params) => <TextField {...params} label="Filter by Tags" />}
            />
          </Grid>
          <Grid item style={{ marginBottom: '16px' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleClickOpen}
            >
              Add New Product
            </Button>
          </Grid>

          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogContent>
              <DialogContentText>
                To add a new product, please enter the product name, select a category, assign tags, and specify the raw materials with their quantities.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Product Name"
                type="text"
                fullWidth
                value={newProduct.prodName}
                onChange={(e) => setNewProduct({ ...newProduct, prodName: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Price"
                type="number"
                fullWidth
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => option.name}
                value={newProduct.category}
                onChange={(event, newValue) => {
                  setNewProduct({ ...newProduct, category: newValue });
                }}
                renderInput={(params) => <TextField {...params} label="Category" />}
                sx={{ mt: 2 }}
              />
              <Autocomplete
                multiple
                options={tags}
                getOptionLabel={(option) => option.name}
                value={newProduct.tags}
                onChange={(event, newValue) => {
                  setNewProduct({ ...newProduct, tags: newValue });
                }}
                renderInput={(params) => <TextField {...params} label="Tags" />}
                sx={{ mt: 2 }}
              />
              {newProduct.rawMaterials.map((material, index) => (
                <Grid container spacing={2} key={index}>
                  <Grid item xs={6}>
                    <Autocomplete
                      options={materialOptions}
                      getOptionLabel={(option) => option.materialName}
                      // value={materialOptions.find(opt => opt.materialId === material.materialId) || null}
                      onChange={(event, newValue) => {
                        const newRawMaterials = [...newProduct.rawMaterials];
                        newRawMaterials[index].materialId = newValue ? newValue.id : '';
                        setNewProduct({ ...newProduct, rawMaterials: newRawMaterials });
                      }}
                      renderInput={(params) => <TextField {...params} label="Raw Material" margin="normal" />}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Quantity"
                      fullWidth
                      name="rawMaterialQuantity"
                      value={material.rawMaterialQuantity}
                      onChange={(e) => handleInputChange(index, e)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton onClick={() => handleRemoveRawMaterial(index)} color="error">
                      <CancelPresentationIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button onClick={handleAddRawMaterial} startIcon={<AddIcon />} variant="contained">
                Add Material
              </Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">Cancel</Button>
              <Button onClick={handleAddProduct} color="primary">Add Product</Button>
            </DialogActions>
          </Dialog>
          <TableContainer component={Paper} sx={{ mt: 3, border: '1px solid #ccc' }}>
            <Table>
              <TableHead
                sx={{
                  backgroundColor: theme.palette.mode === 'light' ? '#f0f0f0' : theme.palette.background.default,
                  fontWeight: 'bold',
                }}>
                <TableRow sx={{ bgcolor: theme.palette.background.main, fontWeight: 'bold' }}>
                  <TableCell onClick={() => handleSort('prodName')} sx={{ cursor: 'pointer' }}>Product Name</TableCell>
                  <TableCell onClick={() => handleSort('price')} sx={{ cursor: 'pointer' }}>Price</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product) => (
                  <TableRow key={product.prodId} hover sx={{ borderBottom: '1px solid #ddd' }}>
                    <TableCell>{product.prodName}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>
                      {product.tags.map((tag) => {
                        const randomColor = getTagColor(tag);
                        return <Chip key={tag.id} label={tag.name} sx={{ mr: 1, backgroundColor: randomColor, textTransform: 'capitalize' }} />;
                      })}
                    </TableCell>
                    <TableCell>{product.category?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Button variant="outlined" color="secondary" onClick={() => fetchRawMaterials(product.prodId)}>
                        View Raw Materials
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: '1.2rem', // Increases font size
                  color: '#1976d2', // Changes color to blue
                }
              }}

              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={sortedProducts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
          {selectedProduct && (
            <>
              <Typography variant="h6" component="h4" mt={4} gutterBottom>
              Raw Materials for {products.find(product => product.prodId === selectedProduct)?.prodName || 'Selected Product'}
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 3, border: '1px solid #ccc' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                      {/* <TableCell>Raw Material ID</TableCell> */}
                      <TableCell>Raw Material Name</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rawMaterials.map((material) => (
                      <TableRow key={material.id} sx={{ borderBottom: '1px solid #ddd' }}>
                        {/* <TableCell>{material.rawMaterial.id || 'N/A'}</TableCell> */}
                        <TableCell>{material.rawMaterial.materialName || 'N/A'}</TableCell>
                        <TableCell align="right">{material.rawMaterialQuantity || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}


        </Container>
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

      </Box>
    </Box>
  );
};

export default Products;