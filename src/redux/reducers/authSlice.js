import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  userDetails: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { userDetails, keepMeSignedIn } = action.payload;
      state.isLoggedIn = false;
      state.userDetails = userDetails;

      if (keepMeSignedIn) {
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
      } else {
        sessionStorage.setItem('userDetails', JSON.stringify(userDetails)); // use sessionStorage if not kept signed in
      }
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userDetails = null;

      localStorage.removeItem('userDetails');
      sessionStorage.removeItem('userDetails');
    },
    loadAuth: (state) => {
      const storedUser = localStorage.getItem('userDetails') || sessionStorage.getItem('userDetails');
      if (storedUser) {
        state.isLoggedIn = true;
        state.userDetails = JSON.parse(storedUser);
      }
    }
  }
});


export const { loginSuccess, logout, loadAuth } = authSlice.actions;

export default authSlice.reducer;
