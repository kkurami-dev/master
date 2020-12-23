/** -*- coding: utf-8-unix -*-
 * ブラウザのメモリ領域にデータを保持するサンプル
 */
import React, { Component } from 'react';

const KEY = 'savedContents';
export default class Storage extends  Component {
   constructor(props) {
     super(props);
     this.state = {
       contents: JSON.parse(localStorage.getItem( KEY )) || [],
     };
   }

  handleSubmit = () => {
    let contentArray = this.state.contents;
    contentArray.push({
      // 省略
      // 投稿内容
    });
    
    this.setState({
      contents: contentArray
    }, () => {
      let {contents} = this.state;
      localStorage.setItem(KEY, JSON.stringify(contents))
    });
  }

  /**
   * ブラウザ内にデータを保持する
   */
  //useEffect( () => localStorage.setItem(APP_KEY, JSON.stringify(state)), [state])

  render() {
    let data = this.state.data;
    return (
      <div>
        {/* 文字出力のサンプル */}
        <div>
          The stored value is: {this.state.storageValue}
          {this.state.message}<br />
          {data.val1}<br />
          {data.val2}<br />
        </div>
      </div>
    );
  }
}

