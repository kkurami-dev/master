/** -*- coding: utf-8-unix -*-
 * 
 */
import React, { Component } from 'react';

class Hello extends  Component {
  constructor(props) {
    super(props)
    console.log(props);
  }
  render() {
    return (
      <div>
        Hello
        {
          //this.props.location.query.name || 'World'
        }
      </div>
    );
  }
}

export default Hello;
