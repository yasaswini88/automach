import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import store from './redux/store'; //Importing store from redux/store
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
// import dotenv from 'dotenv';


const root = ReactDOM.createRoot(document.getElementById('root'));
// dotenv.config();

root.render(
  <React.StrictMode>
    {/* // Wrap the App with Provider and pass as prop store */}
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


// ReactDOM.render(<App />, document.getElementById('root'));