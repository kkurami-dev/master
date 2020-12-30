/** -*- coding: utf-8-unix -*-
 * 
 */
// React 関連モジュール
import React, { Component } from 'react';
//import fs from 'fs';

// ローカルのモジュール
import history from '../history';

// 追加機能関連モジュール
//const exec = require('child_process').exec;
//const fs = require('fs');
//const mktemp = require('mktemp');
//const moment = require('moment');
//const pdf = require('html-pdf');
//const mkdirp = require('mkdirp');
//const tmp = require('tmp');

class Form extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url:""
    }
  }

  saveHTML = (event) => {
    console.log(event);
    //convertPDF( event, this.state.url, ".", (e) => {
    //let tmp = 'https://web3js.readthedocs.io/en/v1.2.6/web3-eth.html';
    // convertPDF( event, tmp, "./out", (e) => {
    //   console.log(e);
    // });
  };

  render() {
    return (
      <div>
        <button onClick={() => history.push('/')}>GoBack</button>
        <p>URL:<br/>
          <textarea type="text" onChange={(e) => this.setState({url: e.target.value})} />
        </p>
        <button className="box" onClick={(e) => this.saveHTML(e)}>
          HTML のPDF保存
        </button>
      </div>
    );
  };
}

export default Form;
