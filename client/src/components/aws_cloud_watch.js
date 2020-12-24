/** -*- coding: utf-8-unix -*-
 * 
 */
import React, { Component } from 'react';
import { getLambdaLog } from '../lib/lib_aws';

import "../App.css";

export default class CloudWatch extends  Component {
  constructor(props) {
    super(props)
    this.state = {
        logs: false,
    }
  }

  handleLogs = () => {
    if(this.state.logs) {
      this.setState({ logs: false });
    } else {
      this.setState({ logs: true });
      getLambdaLog("BlockChainMain", (io) => {
        return this.state.logs;
      });
      console.log("getLambdaLog()");
    }
  }

  render() {
    return (
      <div>
        <h1>CloudWatch Logs</h1>
        <p className="attention">{this.state.logs && "Lambda 関数ログ取得中"}</p>
        <button className="box" onClick={this.handleLogs} name="send">ログ取得</button><br/>
      </div>
    );
  }
}
