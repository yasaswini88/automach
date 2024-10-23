import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define async actions
export const fetchRawMaterials = createAsyncThunk(
  "rawMaterials/fetchRawMaterials",
  async () => {
    const response = await axios.get("http://localhost:8080/api/rawmaterials");
    return response.data;
  }
);

export const addRawMaterial = createAsyncThunk(
  "rawMaterials/addRawMaterial",
  async (newMaterial) => {
    const response = await axios.post("http://localhost:8080/api/rawmaterials", newMaterial);
    return response.data;
  }
);

export const updateRawMaterial = createAsyncThunk(
  "rawMaterials/updateRawMaterial",
  async (updatedMaterial) => {
    const response = await axios.put(`http://localhost:8080/api/rawmaterials/${updatedMaterial.id}`, updatedMaterial);
    return response.data;
  }
);

export const deleteRawMaterial = createAsyncThunk(
  "rawMaterials/deleteRawMaterial",
  async (id) => {
    await axios.delete(`http://localhost:8080/api/rawmaterials/${id}`);
    return id;
  }
);

// Initial state
const initialState = {
  rawMaterials: [],
  status: 'idle',
  error: null,
};

// Creating a slice
const rawMaterialSlice = createSlice({
  name: "rawMaterials",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRawMaterials.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRawMaterials.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.rawMaterials = action.payload;
      })
      .addCase(fetchRawMaterials.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addRawMaterial.fulfilled, (state, action) => {
        state.rawMaterials.push(action.payload);
      })
      .addCase(updateRawMaterial.fulfilled, (state, action) => {
        const index = state.rawMaterials.findIndex(material => material.id === action.payload.id);
        if (index !== -1) {
          state.rawMaterials[index] = action.payload;
        }
      })
      .addCase(deleteRawMaterial.fulfilled, (state, action) => {
        state.rawMaterials = state.rawMaterials.filter(material => material.id !== action.payload);
      });
  },
});

// Exporting actions
export const { } = rawMaterialSlice.actions;

// Exporting reducer
export default rawMaterialSlice.reducer;
