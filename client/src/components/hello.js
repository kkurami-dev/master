/** -*- coding: utf-8-unix -*-
 * 
 */
import React, { Component, useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';

const MetaMasck = () => {
  const [account, setAccount] = useState(null);
  const [metaMaskFlag, setMetaMaskFlag] = useState(false);

  useEffect(() => {
    const tmpFlag = window.ethereum && window.ethereum.isMetaMask;
    setMetaMaskFlag(tmpFlag);
  }, []);

  const connectWallet = () => {
    window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then((result) => {
        setAccount(result[0]);
      })
      .catch((error) => {
        alert("メタマスクをChromeにインストールしてください");
      });
  };

  return (
    <div className="App">
      自分のアドレス：<div id="address" val={account}>{account}</div>
      <div>
        {account ? (
          <button>メタマスクに接続済み</button>
        ) : (
          <button onClick={connectWallet}>メタマスクに接続する</button>
        )}
      </div>
    </div>
  );
}

const enable = async () => {
  const provider = await detectEthereumProvider({ mustBeMetaMask: true });
  if (provider && window.ethereum?.isMetaMask) {
    console.log('Welcome to MetaMask User');

    let web3 = new Web3(Web3.givenProvider);
    web3.eth.defaultChain = "ropsten";
    return web3;
  } else {
    alert("メタマスクをChromeにインストールしてください");
    console.log('Please Install MetaMask')
    return null;
  }
}

const TokenCheck = () => {
  const [toAmo, setToAmo] = React.useState(0);
  const [fromAmo, setFromAmo] = React.useState(0);
  const [toAmoE, setToAmoE] = React.useState(0);
  const [fromAmoE, setFromAmoE] = React.useState(0);

  const check = async() => {
    let web3 = await enable();

    let addr = document.getElementById("address").textContent;
    if(!addr){
      alert("メタマスクに接続してください");
      return;
    }
    web3.eth.getBalance(addr).then((ret) => {
      let ether = web3.utils.fromWei(ret, 'ether');
      console.log('FromAmo', ret, ether);
      setFromAmo(ret);
      setFromAmoE(ether);
    });

    let toAddr = document.getElementById("toAddr").value;
    if(!toAddr) return;
    web3.eth.getBalance(toAddr).then((ret) => {
      let ether = web3.utils.fromWei(ret, 'ether');
      console.log('ToAmo', ret, ether);
      setToAmo(ret);
      setToAmoE(ether);
    });
  }

  return (
    <div className="App">
      <Button variant="contained" onClick={check}>残高確認</Button>
      送信元：{fromAmoE}<div id="fromAmo">{fromAmo}</div>
      受信先：{toAmoE}<div id="toAmo">{toAmo}</div>
    </div>
  );
}

const SelectAddr = () => {
  const [age, setAge] = React.useState('');
  const handleChange = (event) => {
    let el = document.getElementById("toAddr");
    el.value = event.target.value;
    setAge(event.target.value);
  };

  return (
    <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
      <InputLabel id="demo-simple-select-standard-label">送信先の選択</InputLabel>
      <Select
        labelId="demo-simple-select-standard-label"
        id="demo-simple-select-standard"
        value={age}
        onChange={handleChange}
        label="送信先の選択"
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        <MenuItem value={'0x6A55B7528152b5b7C5BacFE426e3664BD91B553a'}>ステージング環境</MenuItem>
        <MenuItem value={'0x6A55B7528152b5b7C5BacFE426e3664BD91B553b'}>開発環境</MenuItem>
      </Select>
    </FormControl>
  );
}

const Transfer = () => {
  const send = async () => {
    let web3 = await enable();

    let value = 0;
    const fromAmo = document.getElementById("fromAmo").textContent;
    const toAmo = document.getElementById("fromAmo").textContent;
    const from_arr = await web3.eth.requestAccounts();
    const from = from_arr[0];
    const to = document.getElementById("toAddr").value;
    console.log('param', from, to, value, fromAmo, toAmo);
    if(!fromAmo || !toAmo || !from || !to){
      alert("メタマスクに接続し、残高を確認してください");
      return;
    }
    if(fromAmo < 80000000000000){
      alert("https://faucet.polygon.technology/ でトークンを取得してください");
      return;
    }
    value = fromAmo - 80000000000000;

    web3.eth
      .sendTransaction({ from, to, value})
      .then(function(receipt){
        console.log('receipt', receipt)
      });
  }

  return (
    <div className="App">
      <Button variant="contained" onClick={send}>送信</Button>
    </div>
  );
}

class Hello extends  Component {
  render() {
    return (
      <div id="send-matic-token">
        <h1>所持しているトークンを送る</h1>
        前提
        <ul>
          <li>ブラウザにメタマスクの拡張機能をインストールすること</li>
          <li>Polygon テストネットワーク（Matic mumbai）に接続しておく( https://crypto-times.jp/matic-metamask/ )</li>
          <li>https://faucet.polygon.technology/ でマティックトークンを取得</li>
        </ul>
        <MetaMasck />

        <TextField id="toAddr" label="送り先" type="text" />
        <SelectAddr />

        <TokenCheck />
        <Transfer />
      </div>
    );
  }
}

export default Hello;
