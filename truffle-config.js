const path = require("path");

module.exports = {
  // Configure your compilers
  // compilers: {
  //   solc: {
  //     version: ">=0.4.24", // Fetch exact version from solc-bin (default: truffle's version)
  //   }
  // },
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545
    }
  },
  
};
