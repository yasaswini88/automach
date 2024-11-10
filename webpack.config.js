module.exports = {
    // other config settings...
    resolve: {
      fallback: {
        "path": require.resolve("path-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "crypto": require.resolve("crypto-browserify")
      }
    }
  };
  