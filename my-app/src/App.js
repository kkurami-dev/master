import React from 'react';
import logo from './logo.svg';
import './App.css';

import MetaTransactionClient from './metatx/metaTransactionClient.js'
//import txSer from './metatx/metaTransactionServer.js'

const targetAddress = 0;
const clientAccountAddress = 0;
const clientAccountPrivateKey = 0;
const txRelayContractAddress = 0;

function App() {
  function handleClick1(e) {
    e.preventDefault();
    console.log('The link was clicked.');
  }

  function handleClick2(e) {
    e.preventDefault();
    console.log('The link was clicked.');
  }

  async function sendClick(e) {
    e.preventDefault();

    let targetAbi
    let targetFunctionName
    let args
    
    
    let rawTx = await MetaTransactionClient.createTx(targetAbi, targetFunctionName, args, {
      to: targetAddress,
      value: 0,
      nonce: 0, // nonce must match the one at TxRelay contract
      gas: 2000000,
      gasPrice: 2000000,
      gasLimit: 2000000
    });

    // result txToServer object should be send to app server
    let txToServer = await MetaTransactionClient.createRawTxToRelay(
      rawTx,
      clientAccountAddress,
      clientAccountPrivateKey,
      txRelayContractAddress
    );
    
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <br/>
        <button onClick={sendClick}>
          送信
        </button>
        <br/>
        <button onClick={handleClick1}>
          Click me
        </button>
        <br/>
        <button onClick={handleClick2}>
          Click me
        </button>
      </header>
    </div>
  );
}

export default App;
