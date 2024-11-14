const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log(process.env.REACT_APP_API_URL)
  app.use(
    '/api',
    createProxyMiddleware({
target: `http://98.82.11.0:8080/api`,
    // target: `http://localhost:8080`,      
      changeOrigin: true,
    })
  );
};
