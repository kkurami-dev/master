import React, { Component }  from "react";
import { Router, Route } from 'react-router-dom';

import history from './history';
import Main from './components/main';
import Welcome from './components/welcome';
import Hello from './components/hello';
import Form from './components/form';

import DropDownMenu from './components/react_drop_down_menu'

import Web3Ethereum from './components/web3_ethereum';

var token;
var kmsEncyptedToken = "CiC**********************************************************************************************I=";

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
  state = { storageValue: 0,
            web3: null,
            accounts: null,
            contract: null
          };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  render() {
    return (
      <div className="App">
        <Router history={history}>
          <div>
            <DropDownMenu />
            <button onClick={handleClick}>クリック時の動作ログ出力</button><br/>

            <Route path="/" exact component={Main} />
            <Route path="/welcome" exact component={Welcome} />
            <Route path="/hello" exact component={Hello} />
            <Route path="/form" exact component={Form} />
            <Route path="/eth" exact component={Web3Ethereum} />
          </div>
        </Router>
      </div>
    );
  };
}

export default App;
