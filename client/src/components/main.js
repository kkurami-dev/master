/** -*- coding: utf-8-unix -*-
 * 最初に読み込む、画面分割のサンプル
 */
import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
//import { Link, withRouter } from 'react-router';
import { withRouter } from 'react-router';

import "../App.css";

//var ReactRouter = require('react-router');
class Main extends Component {
  listenToName(e) {
    e.preventDefault();
    const name = window.prompt("What's your name?", '');
    this.props.router.push({ pathname: '/hello', query: { name } });
  }
/*
          <li><Link to='/welcome'>Welcome</Link></li>
          <li><Link onClick={this.listenToName.bind(this)} to='/hello'>Hello</Link></li>
          <li><Link to='/form'>Form</Link></li>

*/
  
  style = {
    border: '3px solid green'
  };

  render() {
    return (
      <div>
        <h1>Main</h1>
        <ul>
          <li></li>
        </ul>
        <SplitPane split="vertical" minSize={50} defaultSize="20%">
          <div className="leftMenu">test1<br/>test1<br/></div>
          <div className="split">test2<br/>test2<br/></div>
        </SplitPane>
        {this.props.children}
      </div>
    );
  }
}

export default withRouter(Main);
