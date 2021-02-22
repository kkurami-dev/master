/** -*- coding: utf-8-unix -*-
 * 最初に読み込む、画面分割のサンプル
 */
/* global BigInt */
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
import { callDefFunc } from "../lib/lib_aws.js"

moment.locale('ja');

//const selectInputRef = useRef();

const data_param = {
  data1: 1,
  data2: true,
  data3: "aaaaaaaaaaaaaaaaaaaaaa",
  data4: [1, 2, 3],
  data5: "bbbbbbbbbbbbbbb",
  time6: '',
  item7: ''
};

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry1', label: 'Strawberry1', data1:"",  },
  { value: 'strawberry2', label: 'Strawberry2' },
  { value: 'strawberry3', label: 'Strawberry3' },
  { value: 'strawberry4', label: 'Strawberry4' },
  { value: 'strawberry5', label: 'Strawberry5' },
  { value: 'strawberry6', label: 'Strawberry6' },
  { value: 'vanilla', label: 'Vanilla' }
];

const data_def = { idx:0,
                   data3:false,
                   data4:false,
                   data5:false,
                   data6:false,
                   value: 'strawberry100000',
                   label: 'Strawberry10000',
                   data1:100000000000000,
                   data2:false,
                 };

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

//var ReactRouter = require('react-router');
class Main extends Component {
  constructor(props) {
    super(props);

    const bigdata = [];
    for(let i = 0; i < 20000; i++){
      let val = getRandomInt(0, 100000000000000000000000000000000);
      bigdata.push( { idx:i,
                      value: 'strawberry1' + i,
                      label: 'Strawberry1'+i,
                      data1:100000000000000 + i,
                      data2: val,
                      data3:false,
                      data4:'あああああああああああああああああああああああああああああああああ',
                      data5:['いいいいいいいいいいいいいいいい', 'ううううううううううううううう']
                    });
    }

    this.state = {
      bigdata,
      item: null
    };
  }

  listenToName(e) {
    e.preventDefault();
    const name = window.prompt("What's your name?", '');
    this.props.router.push({ pathname: '/hello', query: { name } });
  }

  gachasub = (e) => {
    callDefFunc({ data1:""}, (data) => {
      let bigdata = this.state.bigdata;
      let arr = bigdata[0];
      if(arr.label === 'Strawberry10'){
        arr.label = 0;
        arr.value = 0;
        arr.data3 = 0;
      }

      if( !data || !data.res || !data.res.id ){
        console.error(e, "callDefFunc", data );
        return;
      }
      let id = data.res.id;

      //console.log(data, arr);
      //console.log(e);
      if(id > 5000)
        arr.label++;
      else if(id > 4000)
        arr.value++;
      else
        arr.data3++;

      let all = arr.label + arr.value + arr.data3
      arr.idx =
        "all:" + all + ' ' +
        parseInt((arr.label * 100) / all, 10) + ' / ' +
        parseInt((arr.value * 100) / all, 10) + ' / ' +
        parseInt((arr.data3 * 100) / all, 10);

      this.setState({
        bigdata
      });
    });
  }

  gacha = (e) => {
    let count = 0;
    const max = 1000;

    const items = [];
    for(let i = 0; i < max; i++){
      items.push( i );
    }
    items.forEach( (items) => {
      let wait = getRandomInt(2000, 30000);
      let io = setTimeout( this.gachasub, wait, 'gacha' );
    });
  };

  clean_select = (e) => {
    this.setState({
      item: null
    });
  }

  render() {
    const items = ['Sun', 'Mon', 'Tue', 'Wed'];
    const data = this.state;
    return (
      <>
        <h1>Main</h1>
        <ul>
          <li></li>
        </ul>
          <div className="leftMenu">test1<br/>test1<br/>
          </div>
          <div className="split">test2<br/>test2<br/>
            <button onClick={(e) => this.clean_select(e)}>複数選択の削除</button><br/>
            <DateTimePicker defaultValue={new Date()}
                            onChange={val => this.setState({ time:val })}/>
            <Select options={options}
                    onChange={val => this.setState({ item:val })}
                    value={data.item}
                    isMulti />
            <button className="box" onClick={this.gacha} name="send">ガチャ</button>
            <button className="box" onClick={this.gachasub} name="send">ガチャ(1回)</button><br/>
            {/* テーブルの書き方 https://code-kitchen.dev/html/table/ */}
            <table className="type05">
              <thead>
                <tr>
                  <th>id</th>
                  <th>data1</th>
                  <th>data2</th>
                  <th>data3</th>
                  <th>data4</th>
                  <th>data5</th>
                  <th>data6</th>
                  <th>data7</th>
                  <th>data8</th>
                </tr>
              </thead>
              <tbody>{data.bigdata.map(
                (item, id) => ( <tr key={id}>{
                  Object.keys(data_def).map((key, iid) => <td key={iid}>{
                    !item[key] ? '-' :
                      item[key] === null ? 'null' :
                      typeof item[key] === 'boolean' ? (item[key] ? 'true' : 'false') :
                      typeof item[key] === 'Object' ? item[key].toString() :
                      item[key]
                  }</td>)
                }</tr>)
              )}</tbody>
            </table>
          </div>
        {this.props.children}
      </>
    );
  }
}

export default withRouter(Main);
