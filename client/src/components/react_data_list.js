/**  -*- coding: utf-8-unix -*-
 *
 * データの内容をリストする
 *
 * きも：react-loops
 *     node_modules/react-loops/README.md
 * 参考ページ
 *   react-loopsでReactのリスト表示を美しく簡潔に書く
 *   https://qiita.com/taneba/items/fdb2d4cfb85d8ef5fdf3
 */
import React from 'react';
import { For } from 'react-loops';
import 'react-widgets/dist/css/react-widgets.css';
//import DropdownList from 'react-widgets/lib/DropdownList';
import { DropdownList } from 'react-widgets'

import "../App.css";
import history from '../history';

/** リスト項目(DynamoDB や json でファイルにしてもよい) */
let itemList = [
  {name:"/welcom",  title:"welcom へ"},
  {name:'/hello',   title:"hello へ"},
  {name:"/form",    title:"form へ"},
  {name:"/aws_cwl", title:"CloudWatch Logs"},
  {name:"/aws_ddb", title:"DynamoDB"},
  {name:"/aws_kms", title:"AWS Key Management Service"},
  {name:"/input",   title:"Reack の入力"},
  {name:"/storage", title:"Reack ブラウザストーレジ"},
  {name:"/eth",     title:"Web3 Ethereum"},
  {name:"/welcom",  title:"welcom へ"},
  {name:'/hello',   title:"hello へ"},
  {name:"/form",    title:"form へ"},
  {name:"/aws_cwl", title:"CloudWatch Logs"},
  {name:"/aws_ddb", title:"DynamoDB"},
  {name:"/aws_kms", title:"AWS Key Management Service"},
  {name:"/input",   title:"Reack の入力"},
  {name:"/storage", title:"Reack ブラウザストーレジ"},
  {name:"/eth",     title:"Web3 Ethereum"},
  {name:"/welcom",  title:"welcom へ"},
  {name:'/hello',   title:"hello へ"},
  {name:"/form",    title:"form へ"},
  {name:"/aws_cwl", title:"CloudWatch Logs"},
  {name:"/aws_ddb", title:"DynamoDB"},
  {name:"/aws_kms", title:"AWS Key Management Service"},
  {name:"/input",   title:"Reack の入力"},
  {name:"/storage", title:"Reack ブラウザストーレジ"},
  {name:"/eth",     title:"Web3 Ethereum"},
];

export default class DataList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listOpen: false,
      search:[{}],
      items:    [{name:'name', id:0}, {name:'title',id:1}], /** この項目は固定なので json などから読み込んだり */
    }
  }

  /** フィルターの指定と判定 
   *    配列操作: https://www.sejuku.net/blog/22295
   */
  /**
   * 検索項目の追加
   */
  addSearch = (e) => {
    let search = this.state.search;
    search.unshift({word:"", row:""});
    this.setState({ search });
  }
  /**
   * 検索項目の削除
   */
  delSearch = (e, val) => {
    let search = this.state.search;
    //console.log(e.target.value, val);
    search.splice(val, 1);
    this.setState({ search });
  }
  /**
   * 検索項目の内容を設定
   */
  setSearch = (val, key, v) => {
    console.log("setSearch()", val, key, v);
    if(v){
      //console.log(v.originalEvent.currentTarget());
    }

    let ret_val;
    let search = this.state.search;
    if(val.target) {
      search[key].word = val.target.value;
      ret_val = val.target.value;
    } else {
      search[key].row = val.name;
      ret_val = val.name;
    }
    this.setState({ search });
    return ret_val;
  }
  /**
   * 検索項目に従って、リストを表示/非表示の判定を実施
   *   e.name === e[ 'name ' ] が同じ意味の為
   */
  filter = (e) => {
    //console.log("input", e);
    let search = this.state.search;
    for(let i = 0; i < search.length; i++ ){
      let elm = search[i];
      if ( !elm.row || !elm.word ) continue;
      //  例：e.name.indexOf( 'aws ' ) のような評価を行っている
      if ( e[elm.row].indexOf( elm.word ) === -1) return false;
    }
    return true;
  }

  /**
   * リストの選択時の処理
   */
  item_edit = (e) => {
    let val = e.target.name;
    console.log("data", val);
    history.push({ pathname: '/detail', state: { talbe:1, ...itemList[val] }});// 遷移先とパラメータを指定
  }
  item_delete = (e) => {
    let val = e.target.name;
    console.log("data", val);
    history.push({ pathname: '/detail', state: { talbe:1, ...itemList[val] }});
  }

  ListDataKey = (a, b, c, d) => {
    console.log("ListDataKey()", a, b, c, d);
    return a.item.name;
  }

  SelectItem = (item) => {
    console.log("SelectItem()", item);
    // return (
    //   <span>
    //     <strong>{item.id}</strong>
    //     {" " + item.name}
    //   </span>
    // )
    this.setState({ select_item: item });
  };

  render() {
    let search = this.state.search;
    let data = this.state.items;
    let select_item = this.state.select_item;
    return (
      <div>
        <br/>
        <table className="type06">
          <thead>
            <tr><th>検索条件指定</th></tr>
          </thead>
          <tbody>
            <For of={search} ifEmpty={<div>no items</div>}>
              {(item, {isLast, key}) => isLast
               ? (<tr>
                    <td colSpan="2"></td><td><button onClick={e => this.addSearch(e)}>検索条件の追加</button></td>
                  </tr>)
               : (<tr>
                    <td>列: <DropdownList /* readOnly */
                                          data={data}
                                          value={(select_item && select_item.name) || ""}
                                          onSelect={this.SelectItem}
                                          renderListItem={this.ListDataKey}
                                          onChange={(e, v)=> this.setSearch(e, key, v)} /></td>
                    <td>内容:<input type="text" value={search[key].word} onChange={e => this.setSearch(e, key)} /></td>
                    <td><button onClick={e => this.delSearch(e, {key})}>削除</button></td>
                  </tr>)
              }
            </For>
          </tbody>
        </table>
        <br/>
        <table className="type06">
          <thead>
            <tr><th>位置</th><th>名前(name)</th><th>タイトル(title)</th><th colSpan="2" >操作</th></tr>
          </thead>
          <tbody>
            <For of={itemList} ifEmpty={<div>no items</div>}>
              {(item, {isLast, key}) => this.filter(item)
               && (
                 <tr>
                   <td>{key}{isLast && '(最後)'}</td>
                   <td>{item.name}</td>
                   <td>{item.title} </td>
                   <td><button onClick={this.item_edit} name={key}>編集</button></td>
                   <td><button onClick={this.item_delete} name={key}>削除</button></td>
                 </tr>
               )}
            </For>
          </tbody>
        </table>
      </div>
    );
  }
}
