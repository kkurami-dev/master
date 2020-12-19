/** -*- coding: utf-8-unix -*-
 * 
 */
import React, { Component } from 'react';
import history from '../history';

class Form extends Component {
  onClick() {
    history.push('/');
  }

  onChange(e) {
    this.setState({name: e.target.value});
  }

  render() {
    return (
      <div>
        Name: <input type='text' onChange={this.onChange.bind(this)} />
        <button onClick={this.onClick.bind(this)}>Go</button>
      </div>
    );
  };
}

export default Form;
