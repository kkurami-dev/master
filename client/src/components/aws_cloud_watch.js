import React, { Component } from 'react';

export default class CloudWatch extends  Component {
  render() {
    return (
      <div>Hello {this.props.location.query.name || 'World'}</div>
    );
  }
}
