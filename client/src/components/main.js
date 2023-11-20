/** -*- coding: utf-8-unix -*-
 * 最初に読み込む、画面分割のサンプル
 */
/* global BigInt */
import loadable from '@loadable/component'

import React, { Component } from 'react';

// 複数選択
//   https://qiita.com/Hitomi_Nagano/items/c00df24dc24e0329167d
//   https://react-select.com/home
//   https://stackoverflow.com/questions/50412843/how-to-programmatically-clear-reset-react-select
//import Select from 'react-select';

//import SplitPane from 'react-split-pane';
//import { Link, withRouter } from 'react-router';
//import { withRouter } from 'react-router';

// リスト
//   https://jquense.github.io/react-widgets/api/DateTimePicker/
// import { DateTimePicker } from 'react-widgets';
//import TablePagination from '@material-ui/core/TablePagination';
import { DataGrid } from '@material-ui/data-grid';

import moment from "moment";
import 'moment/min/locales';

import "../App.css";
//import { callDefFunc } from "../lib/lib_aws.js"

const {callDefFunc} = loadable(() => import('../lib/lib_aws.js'));

moment.locale('ja');

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

//var ReactRouter = require('react-router');
export default class Main extends Component {
  constructor(props) {
    super(props);

    const columns = [
      {field: 'id', headerName: 'ID', width: 70 },
      {field: 'value', headerName: 'VAL', width: 130 },
      {field: 'data1', headerName: 'DATA1', width: 130 },
      {field: 'data4', headerName: '内容', width: 160 },
    ];
    
    const bigdata = [];
    for(let i = 0; i < 20000; i++){
      let val = getRandomInt(0, 100000000000000000000000000000000);
      bigdata.push( { id: i + 1,
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
      columns,
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
    const max = 1000;

    const items = [];
    for(let i = 0; i < max; i++){
      items.push( i );
    }
    items.forEach( (items) => {
      let wait = getRandomInt(2000, 30000);
      setTimeout( this.gachasub, wait, 'gacha' );
    });
  };

  clean_select = (e) => {
    this.setState({
      item: null
    });
  }

  render() {
    const {columns, bigdata } = this.state;
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
          {/* <DateTimePicker defaultValue={new Date()} */}
          {/*                 onChange={val => this.setState({ time:val })}/> */}
          <button className="box" onClick={this.gacha} name="send">ガチャ</button>
          <button className="box" onClick={this.gachasub} name="send">ガチャ(1回)</button><br/>
          {/* テーブルの書き方 https://code-kitchen.dev/html/table/ */}
        </div>
        <div style={{ height: 800, width: '100%' }}>
          <DataGrid rows={bigdata} columns={columns}
                    pageSize={100}
                    rowHeight={35}
                    loading={bigdata.length === 0} />
        </div>
        {this.props.children}
      </>
    );
  }
}
