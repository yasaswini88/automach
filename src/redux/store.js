import { configureStore } from "@reduxjs/toolkit";
import rawMaterialReducer from "./reducers/rawMaterialSlice";
import authReducer from "./reducers/authSlice";

const store = configureStore({
  reducer: {
    rawMaterials: rawMaterialReducer,
    auth: authReducer,
  },
});

export default store;
