const webpack = require('webpack');

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    "fs": false,
    //"buffer": require.resolve("buffer-browserify"),
    //"buffer": false,
    "http": require.resolve("stream-http"),
    "os": require.resolve("os-browserify/browser"),
    "path": require.resolve("path-browserify"),
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "zlib": require.resolve("browserify-zlib"),
  });

  config.resolve.fallback = fallback;
  //config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"];
  config.resolve.extensions.push(".mjs")

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);
  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false,
    }
  });

  return config;
}
