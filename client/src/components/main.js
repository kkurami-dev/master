import React, { Component } from 'react';
//import { Link, withRouter } from 'react-router';
import { withRouter } from 'react-router';

class Main extends Component {
  listenToName(e) {
    e.preventDefault();
    const name = window.prompt("What's your name?", '');
    this.props.router.push({ pathname: '/hello', query: { name } });
  }
/*
          <li><Link to='/welcome'>Welcome</Link></li>
          <li><Link onClick={this.listenToName.bind(this)} to='/hello'>Hello</Link></li>
          <li><Link to='/form'>Form</Link></li>

*/
  render() {
    return (
      <div>
        <h1>Main</h1>
        <ul>
        </ul>

        {this.props.children}
      </div>
    );
  }
}

export default withRouter(Main);
