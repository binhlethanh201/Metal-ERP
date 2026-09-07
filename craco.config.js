const path = require('path');

module.exports = {
  webpack: {
    configure(webpackConfig) {
      // Set devtool to false to disable source map generation/parsing
      webpackConfig.devtool = false;
      
      return webpackConfig;
    },
  },
};
