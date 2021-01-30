const path = require("path");
// https://www.npmjs.com/package/@truffle/hdwallet-provider
const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545,
      myid: 10
    },
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    // ゲルリ
    // $ truffle console --network goerli
    // $ truffle migrate --network goerli
    goerli:{
      provider: () => new HDWalletProvider(mnemonic, `https://rpc.goerli.mudit.blog/`),
      // provider: () => new HDWalletProvider({
      //   mnemonic:[ mnemonic ],
      //   providerOrUrl: 'https://goerli.infura.io/v3/2ZPPNA7ZYD9YY5XNU2NXDBMWQAQINYAP68',
      //   numberOfAddresses: 1,
      //   shareNonce: true,
      //   derivationPath: "m/44'/1'/0'/0/"
      // }),
      //provider: () => new HDWalletProvider(process.env.MNEMONIC, 'https://goerli.infura.io/v3/' + process.env.INFURA_API_KEY),
      network_id: 5,
      confirmations: 2,
      timeoutBlocks: 200,
      //skipDryRun: true,
      gas: 4000000,
      gasPrice: 2000000000,
      //gas: 4465030,
      //gasPrice: 10000000000,
      networkCheckTimeout: 1800000
    },
    // マティック（ムンバイ）
    // // truffle console --network matic
    matic: {
      provider: () => new HDWalletProvider(mnemonic, `https://rpc-mumbai.matic.today`),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      gas: 4500000,
      gasPrice: 10000000000,
      networkCheckTimeout: 180000
    },
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.6.0",// solc: 0.6.0+commit.26b70077.Emscripten.clang
      //evmVersion: <string> // Default: "istanbul"
      evmVersion: "petersburg"

    }
  }
  // Goerli
};
