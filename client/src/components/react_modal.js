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
      modalNotClose: false,
    }
  }

  modalOpen = () => {
    this.setState({modalIsOpen: true});
  }

  modalWaltClose = () => {
    this.setState({modalIsOpen: true, timeId:0});
    let timeId = setTimeout(() => {
      this.setState({modalIsOpen: false, timeId});
      clearTimeout(timeId);
    }, 3000);
  }
  modalWaltCloseFace = () => {
    this.setState({modalIsOpen: true, modalNotClose:true, timeId:0});
    let timeId = setTimeout(() => {
      this.setState({modalIsOpen: false, modalNotClose:false, timeId});
      clearTimeout(timeId);
    }, 3000);
  }

  modalCallBack = ( modalIsOpen ) => {
    let {timeId} = this.state;
    console.log("modalCallBack()", modalIsOpen, timeId);

    if(timeId) clearTimeout(timeId);
    this.setState({modalIsOpen, timeId: 0});
  }

  render() {
    return (
      <div>Lambda
        <ModalWindow modalIsOpen={this.state.modalIsOpen}
                     modalCallBack={this.modalCallBack}
                     modalNotClose={this.state.modalNotClose}
        /><br/>
        <button className="box" onClick={this.modalOpen} name="send">
          モーダルの表示
        </button><br/>
        <button className="box" onClick={this.modalWaltClose} name="send">
          モーダルの表示(3秒で閉じる)
        </button><br/>
        <button className="box" onClick={this.modalWaltCloseFace} name="send">
          モーダルの表示(3秒で閉じる)手動で閉じない
        </button><br/>
        <p>{this.state.logs}</p>
      </div>
    );
  }
}

