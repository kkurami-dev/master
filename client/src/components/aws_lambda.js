/** -*- coding: utf-8-unix -*-
 * 
 */
import React, { Component } from 'react';
import { callLambdaSendToken, getLambdaLog } from '../lib/lib_aws';

import "../App.css";

const STORAGE_KEY = "lambdaContents";

export default class Lambda extends  Component {
  constructor(props) {
    super(props)
    this.state = {
      exec: false,
      logs: false,
      contents: JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    }
  }

  handleSubmit = () => {
    let contentArray = this.state.contents;
    contentArray.push({
      // 省略
      // 投稿内容
    });
 
    this.setState({
      contents: contentArray
    }, () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.contents))
    });
  }

  handleClick = () => {
    if(this.state.exec) {
      console.log("execute");
      return;
    }
    this.setState({ exec: true });
    callLambdaSendToken({type:1}, (err, data) => {
      this.setState({ exec: false });
      if (err) console.log(err, err.stack);
      else {
        console.log(data);
      }
    });
  }

  handleLogs = () => {
    if(this.state.logs) {
      this.setState({ logs: false });
    } else {
      this.setState({ logs: true });
      getLambdaLog("mySendToken", (io) => {
        return this.state.logs;
      });
      console.log("getLambdaLog()");
    }
  }

  render() {
    return (
      <div>Lambda
        <p className="attention">{this.state.exec && "Lambda 関数実行中"}</p>
        <p className="attention">{this.state.logs && "Lambda 関数ログ取得中"}</p>
        <button className="box" onClick={this.handleClick} name="send">mySendToken の実行</button><br/>
        <button className="box" onClick={this.handleLogs} name="send">ログ取得</button><br/>
        <p>{this.state.logs}</p>
      </div>
    );
  }
}

