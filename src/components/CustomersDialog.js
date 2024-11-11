import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress, Autocomplete } from '@mui/material';
import { useLoadScript } from '@react-google-maps/api';

const libraries = ['places'];

const CustomersDialog = ({ open, onClose, onSave, customerData }) => {
  const [customer, setCustomer] = useState({
    customerName: '',
    email: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: ''
  });

  const [loading, setLoading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));

    if (name === 'addressLine1') {
      fetchPlaceSuggestions(value);
    }
  };

  const handleSave = () => {
    const errors = {};

    // Email validation
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(customer.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    // Phone number validation
    if (!/^\d{10}$/.test(customer.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid 10-digit phone number.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    onSave(customer)
    .then(() => {
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    if (customerData) {
      setCustomer(customerData);
    } else {
      setCustomer({
        customerName: '',
        email: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: ''
      });
    }
  }, [customerData, open]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDGHTc6OClMANPGNji-8fwLoxvNkwqdhF0', // Replace with your actual API key
    libraries
  });

  const fetchPlaceSuggestions = (inputValue) => {
    if (!inputValue) return;

    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions({ input: inputValue, componentRestrictions: { country: 'us' } }, (predictions, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        const suggestions = predictions.map((prediction) => ({
          description: prediction.description,
          placeId: prediction.place_id
        }));
        setAddressSuggestions(suggestions);
      } else {
        setAddressSuggestions([]);
      }
    });
  };

  const fetchSelectedPlaceDetails = (placeId) => {
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    service.getDetails({ placeId }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        const addressComponents = {
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: ''
        };

        place.address_components.forEach((component) => {
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

        setCustomer((prev) => ({ ...prev, ...addressComponents }));
      }
    });
  };

  if (loadError) {
    console.error("Error loading Google Maps script:", loadError);
    return <div>Error loading maps</div>;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{customerData ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Customer Name"
          name="customerName"
          value={customer.customerName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          name="email"
          value={customer.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!formErrors.email}
          helperText={formErrors.email}
        />
        <TextField
          label="Phone Number"
          name="phoneNumber"
          value={customer.phoneNumber}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!formErrors.phoneNumber}
          helperText={formErrors.phoneNumber}
        />
        <Autocomplete
          options={addressSuggestions.map((suggestion) => suggestion.description)}
          freeSolo
          onInputChange={(event, newInputValue) => handleChange({ target: { name: 'addressLine1', value: newInputValue } })}
          onChange={(event, value) => {
            const selected = addressSuggestions.find((suggestion) => suggestion.description === value);
            if (selected) {
              fetchSelectedPlaceDetails(selected.placeId);
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Address Line 1" fullWidth margin="normal" />
          )}
        />
        <TextField
          label="Address Line 2"
          name="addressLine2"
          value={customer.addressLine2}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="City"
          name="city"
          value={customer.city}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="State"
          name="state"
          value={customer.state}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Postal Code"
          name="postalCode"
          value={customer.postalCode}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSave} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomersDialog;