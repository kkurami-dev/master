/** -*- coding: utf-8-unix -*-
 * 
 */
import React, { Component } from 'react';
//import React, { Component, useState, useEffect } from 'react';
//import 'react-widgets/dist/css/react-widgets.css';
//import { DropdownList } from 'react-widgets'
import DropdownList from '../lib/DropdownList'

import history from '../history';
import { getLambdaLog } from '../lib/lib_aws';

import "../App.css";

const lambdafuncs = [
  "BlockChainMain",
];

export default class CloudWatch extends Component {
  constructor(props) {
    super(props)
    this.state = {
      logs: false,
      io : 0,
      func: "BlockChainMain"
    }
  }

  componentWillUnmount() {
    let io = this.state.io;
    console.log("componentWillUnmount()", io);
    if(io) {
      this.setState({ logs: false });
      clearInterval( io );
    }
  }

  handleLogs = () => {
    let { func } = this.state;
    if(this.state.logs) {
      this.setState({ logs: false, io:0 });

    } else {
      this.setState({ logs: true });
      getLambdaLog( func, ( result ) => {
        /*  */
        let {io} = result;
        //let {io, data} = result;
        this.setState({ io });

        return this.state.logs;
      });
    }
  }

  render(){
    let logs = this.state.logs;
    return (
      <div>
        <h1>CloudWatch Logs</h1>
        <DropdownList data={lambdafuncs} onChange={(func)=> this.setState({ func })} />
        <button onClick={history.goBack} >戻る</button>
        <button className="box" onClick={this.handleLogs} name="send">
          { logs ? "ログ取得停止" : "ログ取得開始" }
        </button><br/>
        <p className="attention">{this.state.logs && "Lambda 関数ログ取得中"}</p>
      </div>
    );
  }
}
