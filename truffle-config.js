module.exports = {
  networks: {
    develop: {
      port: 8545,
      network_id: "*",
//      gas:4600000,
//      accounts: 5,
//      defaultEtherBalance: 500,
//      blockTime: 3
    }
  },
  compilers: {
    solc: {
      settings: {
        optimizer: {
          enabled: true, // Default: false
          runs: 200      // Default: 200
        },
      }
    }
  }
};
// ../lib/node_modules/truffle/build/cli.bundled.js
