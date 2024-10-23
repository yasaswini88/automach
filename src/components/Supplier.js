import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, TablePagination, Autocomplete } from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { Edit, Delete } from '@mui/icons-material';
import {
  useLoadScript,
  StandaloneSearchBox,
} from '@react-google-maps/api';
import { useTheme } from '@mui/material/styles';

const Supplier = () => {
  const theme = useTheme();

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchValue, setSearchValue] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // For sorting

  const [autocomplete, setAutocomplete] = useState(null);
  const libraries = ['places'];

  const [addressSuggestions, setAddressSuggestions] = useState([]);

  //new state variables
  const [searchBox, setSearchBox] = useState(null);
  const [placesLoaded, setPlacesLoaded] = useState(true);




  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDGHTc6OClMANPGNji-8fwLoxvNkwqdhF0',
    libraries: ['places'],
    onLoad: () => setPlacesLoaded(true),
  });

  // useEffect(() => {
  //   console.log('Google API loaded:', isLoaded);
  //   console.log('Google API loadError:', loadError);
  // }, [isLoaded, loadError]);



  // added this for trying autocomplete places
  const fetchPlaceSuggestions = async (inputValue) => {
    if (!inputValue) return;

    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      { input: inputValue, componentRestrictions: { country: "us" } },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const suggestions = predictions.map(prediction => ({
            description: prediction.description,
            placeId: prediction.place_id,
          }));
          setAddressSuggestions(suggestions);
        }
      }
    );
  };

  useEffect(() => {
    if (selectedSupplier?.addressLine1) {
      fetchPlaceSuggestions(selectedSupplier.addressLine1);
    }
  }, [selectedSupplier?.addressLine1]);


  useEffect(() => {
    fetchSuppliers();
    fetchOrders(); // Fetch all orders when the component loads
  }, []);

  const fetchSuppliers = async () => {
    const response = await axios.get('http://localhost:8080/api/suppliers');
    setSuppliers(response.data);
    setFilteredSuppliers(response.data); // Initialize filtered suppliers
  };

  const fetchOrders = async () => {
    const response = await axios.get('http://localhost:8080/api/orders');
    setOrders(response.data);
  };

  const handleAddOrEdit = async () => {
    if (selectedSupplier.id) {
      await axios.put(`http://localhost:8080/api/suppliers/${selectedSupplier.id}`, selectedSupplier);
    } else {
      await axios.post('http://localhost:8080/api/suppliers', selectedSupplier);
    }
    setOpen(false);
    fetchSuppliers();
  };

  const handleDelete = (id) => {
    setSelectedSupplier(suppliers.find(supplier => supplier.id === id));
    setConfirmDelete(true);  // Show confirmation dialog for all deletions
  };


  // Handle place changed to autofill the address details
  const fetchSelectedPlaceDetails = (placeId) => {
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    service.getDetails({ placeId }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const addressComponents = {
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
        };

        place.address_components.forEach(component => {
          const types = component.types;

          if (types.includes('street_number')) {
            addressComponents.addressLine1 = component.long_name + ' ';
          }
          if (types.includes('route')) {
            addressComponents.addressLine1 += component.long_name;
          }
          if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
            addressComponents.addressLine2 = component.long_name;
          }
          if (types.includes('locality')) {
            addressComponents.city = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            addressComponents.state = component.short_name;
          }
          if (types.includes('postal_code')) {
            addressComponents.postalCode = component.long_name;
          }
        });

        setSelectedSupplier((prevSupplier) => ({
          ...prevSupplier,
          ...addressComponents,
        }));
      }
    });
  };





  const confirmDeleteSupplier = async () => {
    const openOrders = orders.filter(order =>
      order.supplierName === selectedSupplier.name &&
      (order.status === 'Pending' || order.status === 'Shipped')
    );

    if (openOrders.length > 0) {
      alert("There are open orders associated with this supplier.");
    } else {
      await axios.delete(`http://localhost:8080/api/suppliers/${selectedSupplier.id}`);
      fetchSuppliers();
    }

    setConfirmDelete(false);
    setSelectedSupplier(null);
  };


  const handleOpen = (supplier) => {
    setSelectedSupplier(supplier ? supplier : { name: '', email: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setConfirmDelete(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSortByName = () => {
    const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
      // Remove leading/trailing spaces and ensure case-insensitive comparison
      const nameA = a.name.trim().toLowerCase();
      const nameB = b.name.trim().toLowerCase();

      return sortOrder === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    setFilteredSuppliers(sortedSuppliers);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };



  // Search function
  const handleSearchChange = (event, value) => {
    setSearchValue(value);
    const filtered = suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuppliers(filtered);
  };

  const handleSupplierChange = (field, value) => {
    setSelectedSupplier(prevSupplier => ({
      ...prevSupplier,
      [field]: value,
    }));
  };


  if (!isLoaded) return <div>Loading...</div>;
  if (loadError) return <div>Error loading maps</div>;
  return (
    <Paper style={{ padding: '16px' ,backgroundColor: theme.palette.background.paper,  // Use theme-based background color
      color: theme.palette.text.primary  }}>
      <Button variant="contained" color="primary"
        onClick={() => handleOpen(null)}
        style={{ marginLeft: '16px', marginBottom: '16px' }}
      >Add New Supplier</Button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        {/* Search by Supplier Name */}
        <Autocomplete
          options={suppliers.map((supplier) => supplier.name)}
          value={searchValue}
          onInputChange={handleSearchChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Supplier"
              margin="normal"
              style={{ width: '300px', border: '1px solid #ccc' }} // Increase the width of the search box
            />
          )}
        />

        {/* Sort by Name Button */}
        <Button
          variant="outlined"
          onClick={handleSortByName}
          sx={{
            color: theme.palette.text.primary, // Adjust text color for dark mode
            backgroundColor: theme.palette.background.paper ,// Adjust background color
           display: 'flex', alignItems: 'center' }}
        >
          Sort by Name <SwapVertIcon style={{ marginLeft: '8px' }} />
        </Button>
      </div>



      <TableContainer component={Paper}>
      <Table sx={{ border: `1px solid ${theme.palette.divider}` }}> {/* Use dynamic border color */}
    <TableHead sx={{ backgroundColor: theme.palette.background.default }}>
      <TableRow>
        <TableCell sx={{ color: theme.palette.text.primary }}>
                <Button
                  variant="contanied"
                  onClick={handleSortByName}

                  endIcon={<SwapVertIcon />} // Adds the sorting icon at the end of the text
                >
                  Name
                </Button>
              </TableCell>

              <TableCell style={{ color: 'black' }}>Email</TableCell>
              <TableCell style={{ color: 'black' }}>Phone</TableCell>
              <TableCell style={{ color: 'black' }}>Address</TableCell>
              <TableCell style={{ color: 'black' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSuppliers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((supplier) => (
              <TableRow key={supplier.id} style={{ borderBottom: '1px solid lightblack' }}>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{`${supplier.addressLine1}, ${supplier.addressLine2}, ${supplier.city}, ${supplier.state}, ${supplier.postalCode}`}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpen(supplier)}
                    style={{ marginRight: '8px' }}
                    startIcon={<Edit />} // Adds the Edit icon inside the button
                  >
                    Edit
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setConfirmDelete(true);
                    }}

                    startIcon={<Delete />} // Adds the Delete icon inside the button
                  >
                    Delete
                  </Button>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredSuppliers.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            padding: '16px', 
            borderRadius: '8px',
            border: `1px solid ${theme.palette.divider}`,  // Use theme-based border color
            backgroundColor: theme.palette.background.paper, // Use theme-based background color
            color: theme.palette.text.primary, // Use theme-based text color
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', // Adds a shadow for depth
          }
        }}
      >
        <DialogTitle>
          <span style={{ color: '#3f51b5', fontWeight: 'bold' }}>
            {selectedSupplier?.id ? 'Edit Supplier' : 'Add Supplier'}
          </span>
        </DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth value={selectedSupplier?.name || ''} onChange={(e) => handleSupplierChange('name', e.target.value)} />
          <TextField label="Email" fullWidth value={selectedSupplier?.email || ''} onChange={(e) => handleSupplierChange('email', e.target.value)} />
          <TextField label="Phone" fullWidth value={selectedSupplier?.phone || ''} onChange={(e) => handleSupplierChange('phone', e.target.value)} />

          <Autocomplete
            options={addressSuggestions.map((suggestion) => suggestion.description)}
            freeSolo
            onInputChange={(event, newInputValue) => {
              handleSupplierChange('addressLine1', newInputValue);
            }}
            onChange={(event, value) => {
              // Handle selection of suggestion
              const selected = addressSuggestions.find(suggestion => suggestion.description === value);
              if (selected) {
                fetchSelectedPlaceDetails(selected.placeId);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Address Line 1"
                fullWidth
                value={selectedSupplier?.addressLine1 || ''}
                onChange={(e) => handleSupplierChange('addressLine1', e.target.value)}
              />
            )}
          />


          <TextField label="Address Line 2" fullWidth value={selectedSupplier?.addressLine2 || ''} onChange={(e) => handleSupplierChange('addressLine2', e.target.value)} />
          <TextField label="City" fullWidth value={selectedSupplier?.city || ''} onChange={(e) => handleSupplierChange('city', e.target.value)} />
          <TextField label="State" fullWidth value={selectedSupplier?.state || ''} onChange={(e) => handleSupplierChange('state', e.target.value)} />
          <TextField label="Postal Code" fullWidth value={selectedSupplier?.postalCode || ''} onChange={(e) => handleSupplierChange('postalCode', e.target.value)} />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} sx={{ color: '#f44336' }}>Cancel</Button> {/* Red color for cancel button */}
          <Button onClick={handleAddOrEdit} sx={{ backgroundColor: '#3f51b5', color: '#fff', ':hover': { backgroundColor: '#303f9f' } }}>
            {selectedSupplier?.id ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDelete}
        onClose={handleClose}
        PaperProps={{
          sx: {
            padding: '16px', // Adds padding inside the dialog box
            borderRadius: '8px', // Rounds the corners
            border: '1px solid #ccc', // Adds a subtle border
            backgroundColor: '#ffebee', // Light red background for delete confirmation
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)' // Adds a shadow for depth
          }
        }}
      >
        <DialogTitle>
          <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>Confirm Delete</span>
        </DialogTitle>
        <DialogContent>
          There are open orders associated with this supplier. Are you sure you want to delete?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: '#757575' }}>Cancel</Button> {/* Gray color for cancel button */}
          <Button onClick={confirmDeleteSupplier} sx={{ backgroundColor: '#d32f2f', color: '#fff', ':hover': { backgroundColor: '#b71c1c' } }}>
            Delete Anyway
          </Button>
        </DialogActions>
      </Dialog>

    </Paper>
  );

};

export default Supplier;