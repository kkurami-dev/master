/** -*- coding: utf-8-unix -*-
 * 最初に読み込む、画面分割のサンプル
 */
import React, { Component, useRef } from 'react';

// 複数選択
//   https://qiita.com/Hitomi_Nagano/items/c00df24dc24e0329167d
//   https://react-select.com/home
//   https://stackoverflow.com/questions/50412843/how-to-programmatically-clear-reset-react-select
import Select from 'react-select';

import SplitPane from 'react-split-pane';
//import { Link, withRouter } from 'react-router';
import { withRouter } from 'react-router';

// リスト
//   https://jquense.github.io/react-widgets/api/DateTimePicker/
import { DateTimePicker } from 'react-widgets';

import moment from "moment";
import 'moment/min/locales';

import "../App.css";

moment.locale('ja');

//const selectInputRef = useRef();

const data_param = {
  data1: 1,
  data2: true,
  data3: "aaaaaaaaaaaaaaaaaaaaaa",
  data4: [1, 2, 3],
  data5: "bbbbbbbbbbbbbbb"
};

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry1', label: 'Strawberry1' },
  { value: 'strawberry2', label: 'Strawberry2' },
  { value: 'strawberry3', label: 'Strawberry3' },
  { value: 'strawberry4', label: 'Strawberry4' },
  { value: 'strawberry5', label: 'Strawberry5' },
  { value: 'strawberry6', label: 'Strawberry6' },
  { value: 'vanilla', label: 'Vanilla' }
];

//var ReactRouter = require('react-router');
class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null
    };
  }

  listenToName(e) {
    e.preventDefault();
    const name = window.prompt("What's your name?", '');
    this.props.router.push({ pathname: '/hello', query: { name } });
  }

  add_select = (e) => {
    console.log("event:", e);
    this.setState({
      item: e
    });
  }
  clean_select = (e) => {
    this.setState({
      item: null
    });
  }

  render() {
    const items = ['Sun', 'Mon', 'Tue', 'Wed'];
    const {item} = this.state;
    return (
      <div>
        <h1>Main</h1>
        <ul>
          <li></li>
        </ul>
        <SplitPane split="vertical" minSize={50} defaultSize="20%">
          <div className="leftMenu">test1<br/>test1<br/>
          </div>
          <div className="split">test2<br/>test2<br/>
            <button onClick={(e) => this.clean_select(e)}>複数選択の削除</button><br/>
            <DateTimePicker
              defaultValue={new Date()}
            />
            <Select options={options}
                    onChange={val => this.add_select(val)}
                    value={item}
                    isMulti />
            <ul>{
              Object.keys(data_param).map(key => {
                return <li>{key}</li>
              })
            }</ul>
          </div>
        </SplitPane>
        {this.props.children}
      </div>
    );
  }
}

export default withRouter(Main);
