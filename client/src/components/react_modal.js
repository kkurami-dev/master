/** -*- coding: utf-8-unix -*-
 * 
 */
import React, { Component } from 'react';

import ModalWindow from "./sample";
import "../App.css";

export default class Lambda extends  Component {
  constructor(props) {
    super(props)
    this.state = {
      modalIsOpen: true,
    }
  }

  modalOpen = (e) => {
    this.setState({modalIsOpen: true});
  }

  modalWaltClose = (e) => {
    this.setState({modalIsOpen: true});
    let timeId = setTimeout(() => {
      this.setState({modalIsOpen: false});
      clearTimeout(timeId);
    }, 3000);
  }

  modalCallBack = (e) => {
    console.log("modalCallBack()", e);
    this.setState({modalIsOpen: e});
  }

  render() {
    return (
      <div>Lambda
        <ModalWindow modalIsOpen={this.state.modalIsOpen}
                     modalCallBack={this.modalCallBack}
        /><br/>
        <button className="box" onClick={this.modalOpen} name="send">
          モーダルの表示
        </button><br/>
        <button className="box" onClick={this.modalWaltClose} name="send">
          モーダルの表示(3秒で閉じる)
        </button><br/>
        <p>{this.state.logs}</p>
      </div>
    );
  }
}

