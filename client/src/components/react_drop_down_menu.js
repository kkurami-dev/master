/**  -*- coding: utf-8-unix -*-
 * 全体で表示するのメニュー
 */
import React from 'react'
import onClickOutside from 'react-onclickoutside'

import "../App.css";
import history from '../history';

class DropDownMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listOpen: false,
    }
  }

  /**
   * ボタンを押すと、メニューが開いたり、閉じたりさせる
   */
  toggleList() {
    this.setState(prevState => ({
      listOpen: !prevState.listOpen,
    }))
  }

  /**
   * 
   */
  handleClickMenu(val){
    this.setState({
      listOpen: false,
    })
    //alert(val);// ブラウザの機能でポップアップを出す
    console.log("menu", val);
    //history.push(val); // 履歴登録ありの画面遷移
    history.replace(val); // 履歴登録なしの画面遷移
  }

  /**
   * メニュー以外をクリックした場合に、メニューを閉じる
   */
  handleClickOutside() {
    this.setState({
      listOpen: false,
    })
  }

  /**
   * メニューの内容作成
   */
  makeMenuItem(){
    let data = [
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
    let html;

    /**
     *  メニュー用のデータから実際のメニュー一覧を作成
     */
    for(let i = 0; i < data.length; i++ ){
      html = html + (
        <div className="menuContent">
          <div onClick={this.handleClickMenu.bind(this, data[i].name)}>{data[i].title}</div>
        </div>
      );
    }
    /** 最後に全体を囲む要素を追加して作成完了 */
    html = (<div className="menuBox"> {html} </div>);
    
    return html;
  }
 
  render() {
    const { listOpen } = this.state
    return (
      <div className="dropDownMenu">
        <div onClick={this.toggleList.bind(this)} className="menuButton">
          menu
        </div>
        { /**
           * listOpen フラグでメニューが表示されいた(true)
           * の場合だけ makeMenuItem() 関数が実行、処理される(if文的)
           */
          listOpen && this.makeMenuItem.bind(this) }
      </div>
    )
  }
}
 
export default onClickOutside(DropDownMenu)
