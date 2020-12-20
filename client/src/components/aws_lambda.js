/** -*- coding: utf-8-unix -*-
 * 
 */
import React, { Component } from 'react';
import { callLambdaSendToken } from '../lib/lib_aws';

export default class Lambda extends  Component {
  constructor(props) {
    super(props)
    this.state = {
      exec: false,
    }
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

  render() {
    return (
      <div>Lambda
        <p>{this.state.exec && "Lambda 関数実行中"}</p>
        <button className="box" onClick={this.handleClick} name="send">mySendToken の実行</button><br/>
      </div>
    );
  }
}

