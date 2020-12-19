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

import "../App.css";
import history from '../history';

/** メニュー項目(json でファイルにしてもよい) */
const itemList = [
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
  /**
   * リストの選択時の処理
   */
  handleClick = (e) => {
    let val = e.target.name;
    // this.setState({
    //   listOpen: false,
    // })
    console.log("data", val);
    history.push({ pathname: '/detail', state: { talbe:1, ...itemList[val] }});
  }

  render() {
    return (
    <ul>
      <For of={itemList} ifEmpty={<div>no items</div>}>
        {(item, {isLast, key}) => (
          <li>
            {item.title} {isLast && '(最後)'}
            <button onClick={this.handleClick} name={key}>詳細</button>
          </li>
        )}
      </For>
    </ul>
    );
  }
}
