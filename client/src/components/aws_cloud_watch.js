/** -*- coding: utf-8-unix -*-
 * 
 */
import React, { Component, useState, useEffect } from 'react';

import history from '../history';
import { getLambdaLog } from '../lib/lib_aws';

import "../App.css";

export default class CloudWatch extends Component {
// export default function CloudWatch(props){
  // const [count, setCount] = useState(0);

  useEffect = () => {
    console.log("useEffect()");
    document.title = `You clicked times`;
  };
  
  constructor(props) {
    super(props)
    this.state = {
      logs: false,
      io : 0,
    }
  }

  componentWillUnmount() {
    let io = this.state.io;
    console.log("componentWillUnmount()", io);
    if(io) {
      clearInterval( io );
    }
  }

  handleLogs = () => {
    if(this.state.logs) {
      this.setState({ logs: false, io:0 });
    } else {
      this.setState({ logs: true });
      getLambdaLog("BlockChainMain", ( result ) => {
        let {io, data} = result;
        this.setState({ io });
        return this.state.logs;
      });
      console.log("getLambdaLog()");
    }
  }

  render(){
    let logs = this.state.logs;
    return (
      <div>
        <h1>CloudWatch Logs</h1>
        <p className="attention">{this.state.logs && "Lambda 関数ログ取得中"}</p>
        <button onClick={history.goBack} >戻る</button>
        <button className="box" onClick={this.handleLogs} name="send">
          { logs ? "ログ取得停止" : "ログ取得開始" }
        </button><br/>
      </div>
    );
  }
}
