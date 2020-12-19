import React, { Component } from 'react';

export default class Web3Ethereum extends  Component {
  render() {
    return (
      <div>Hello {this.props.location.query.name || 'World'}</div>
    );
  }
}
