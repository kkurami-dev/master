import React, { Component } from 'react';

const APP_KEY = "ReactApp001";
const appState = localStorage.getItem( APP_KEY );
const initialState = appState ? JSON.parse(appState) : {
  events: [],
  operationLogs: []
};

class Hello extends  Component {
   constructor() {
     super();
     this.state = {
       data:{
         val1:"",
         val2:"",
       },
       some_code: "",
       alert_message: ""
     };
   }


  /**
   * ブラウザ内にデータを保持する
   */
  //useEffect( () => localStorage.setItem(APP_KEY, JSON.stringify(state)), [state])

  render() {
    let data = this.state.data;

    return (
      <div>
        {/* 文字出力のサンプル */}
        <div>
          The stored value is: {this.state.storageValue}
          {this.state.message}<br />
          {data.val1}<br />
          {data.val2}<br />
        </div>
      </div>
    );
  }
}

export default Hello;
