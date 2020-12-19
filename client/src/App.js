/** -*- coding: utf-8-unix -*- 
 *
 */
import React, {
  Component,
//  Suspense,
//  lazy
}  from "react";
import {
  Router,
  Route,
  //NavLink
} from 'react-router-dom';

import "./App.css";
import history from './history';

import Main from './components/main';
import Welcome from './components/welcome';
import Hello from './components/hello';
import Form from './components/form';

import CloudWatch from './components/aws_cloud_watch';
import DynamoDB from './components/aws_dynamodb';
import Kms from './components/aws_cloud_watch';
import DropDownMenu from './components/react_drop_down_menu';
import Input from './components/react_input';
import Storage from './components/react_storage';
import DataList from './components/react_data_list';
import DetaDetail from './components/react_data_list_detail';
import Web3Ethereum from './components/web3_ethereum';

//var dom = require('react-router-dom');
//var BrowserRouter = dom.BrowserRouter;
//var Switch = dom.Switch;

export default class App extends Component {
  handleClick = ( e ) => {
    //console.log(e.target, history);
    switch(e.target.name){
    case "top":
      history.push('/');
      break;
    case "back":
      history.goBack();
      break;
    default:
      history.push('/');
      break;
    }
  };

  render() {
    return (
      <div className="App">
        <header>
          <DropDownMenu />
        </header>
        <div className="boxContainer">
          <button className="box" onClick={this.handleClick} name="back">back</button><br/>
          <button className="box" onClick={this.handleClick} name="top">Top</button><br/>
        </div>
        <Router history={history}>
          <div>
            <Route exact path="/" component={Main} />
            <Route path="/welcome" component={Welcome} />
            <Route path="/hello" component={Hello} />
            <Route path="/form" component={Form} />

            <Route path="/aws_cwl" component={CloudWatch} />
            <Route path="/aws_ddb" component={DynamoDB} />
            <Route path="/aws_kms" component={Kms} />

            <Route path="/input" component={Input} />
            <Route path="/storage" component={Storage} />
            <Route path="/data" component={DataList} />
            <Route path="/detail" component={DetaDetail} />

            <Route path="/eth" component={Web3Ethereum} />
          </div>
        </Router>
      </div>
    );
  };
}

