import React, { Component } from 'react';

import SimpleStorageContract from "../contracts/SimpleStorage.json";
import getWeb3 from "../lib/getWeb3";

import "../App.css";

import metaTransactionClient from "../metatx/metaTransactionClient";
import metaTransactionServer from "../metatx/metaTransactionServer";
import Transaction from "../metatx/transaction";

// const metaTransactionClient = require("./metatx/metaTransactionClient");
// const metaTransactionServer = require("./metatx/metaTransactionServer");
// const Transaction = require("./metatx/transaction");

export default class Web3Ethereum extends  Component {
  componentDidMount = async () => {
    console.log("componentDidMount");

    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      
      let getNodeInfo = web3.eth.getNodeInfo();
      let log = {
        web3, window,
        accounts, networkId, deployedNetwork, instance,
        getNodeInfo
      };
      console.log(log);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      //this.setState({ web3, accounts, contract: instance }, this.getDataFromApi);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  render() {
    return (
      <div>Hello {this.props.location.query.name || 'World'}</div>
    );
  }
}
