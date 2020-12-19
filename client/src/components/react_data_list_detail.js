/** -*- coding: utf-8-unix -*-
 * 
 */
import React, { Component } from 'react';

export default class DetaDetail extends  Component {
  constructor(props) {
    super(props);

    console.log("param", props.location.state);
    this.state = props.location.state;
  }

  render() {
    return (
      <div>
        <div>DataDetail</div>
        <div>{this.state.title}</div>
      </div>
    );
  }
}
