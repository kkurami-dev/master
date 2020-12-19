import React, { Component, Suspense, lazy }  from "react";
import { Router, Route } from 'react-router-dom';

import "./App.css";

const history = lazy(() => import('./history'));
const Main = lazy(() => import('./components/main'));
const Welcome = lazy(() => import('./components/welcome'));
const Hello = lazy(() => import('./components/hello'));
const Form = lazy(() => import('./components/form'));

const DropDownMenu = lazy(() => import('./components/react_drop_down_menu'));

const Web3Ethereum = lazy(() => import('./components/web3_ethereum'));

var dom = require('react-router-dom');
var BrowserRouter = dom.BrowserRouter;
var Switch = dom.Switch;

function handleClick(e) {
  e.preventDefault();
  let altKey                  = e.altKey               ,
      bubbles                 = e.bubbles              ,
      button                  = e.button               ,
      buttons                 = e.buttons              ,
      cancelable              = e.cancelable           ,
      clientX                 = e.clientX              ,
      clientY                 = e.clientY              ,
      ctrlKey                 = e.ctrlKey              ,
      currentTarget           = e.currentTarget        ,
      defaultPrevented        = e.defaultPrevented     ,
      detail                  = e.detail               ,
      dispatchConfig          = e.dispatchConfig       ,
      eventPhase              = e.eventPhase           ,
      getModifierState        = e.getModifierState     ,
      isDefaultPrevented      = e.isDefaultPrevented()   ,
      isPropagationStopped    = e.isPropagationStopped() ,
      isTrusted               = e.isTrusted            ,
      metaKey                 = e.metaKey              ,
      movementX               = e.movementX            ,
      movementY               = e.movementY            ,
      nativeEvent             = e.nativeEvent          ,
      pageX                   = e.pageX                ,
      pageY                   = e.pageY                ,
      relatedTarget           = e.relatedTarget        ,
      screenX                 = e.screenX              ,
      screenY                 = e.screenY              ,
      shiftKey                = e.shiftKey             ,
      target                  = e.target               ,
      timeStamp               = e.timeStamp            ,
      type                    = e.type                 ,
      view                    = e.view                 ;
  let log ={
    e,
    altKey,bubbles,button,buttons,cancelable,clientX,clientY,ctrlKey,currentTarget,defaultPrevented,detail,dispatchConfig,eventPhase,getModifierState,isDefaultPrevented,isPropagationStopped,isTrusted,metaKey,movementX,movementY,nativeEvent,pageX,pageY,relatedTarget,screenX,screenY,shiftKey,target,timeStamp,type,view
  };
  console.log(log);
  console.log('The link was clicked.');
}

class App extends Component {
  componentDidMount = async () => {
    console.log("componentDidMount");

    //console.log(BrowserRouter, Switch);
  }
  
  render() {
    return (
      <div className="App">
        <Router history={history}>
          <Suspense fallback={<div>Loading...</div>}>
            <DropDownMenu />
            <button onClick={handleClick}>クリック時の動作ログ出力</button><br/>

            <Route exact path="/" component={Main} />
            <Route exact path="/welcome" component={Welcome} />
            <Route exact path="/hello" component={Hello} />
            <Route exact path="/form" component={Form} />
            <Route exact path="/eth" component={Web3Ethereum} />
          </Suspense>
        </Router>
      </div>
    );
  };
}

export default App;
