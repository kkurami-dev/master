/**  -*- coding: utf-8-unix -*-
 * 全体で表示するのメニュー
 */
import React from 'react'
import onClickOutside from 'react-onclickoutside'

import "../App.css";
import history from '../history';

const menuList = [
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

/**
 * render() から呼べるけど this が
 */
function MakeMenuListF(props) {
  return (
    <div className="menuBox">
      { /* リストの処理全体の処理を記載  */
        menuList.map(item => (
          <div className="menuContent" key={item.name}>
            <div onClick={this.handleClickMenu.bind(this, item.name)}>{item.title}</div>
          </div>
        ))}
    </div>
  );
}

class DropDownMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listOpen: false,
    }
  }

  /**
   * render() から呼べない
   */
  MakeMenuListI(){
    const { listOpen } = this.state
    if (listOpen)
      return (
        <div className="menuBox">
          { /* リストの処理全体の処理を記載  */
            menuList.map(item => (
              <div className="menuContent" key={item.name}>
                <div onClick={this.handleClickMenu.bind(this, item.name)}>{item.title}</div>
              </div>
            ))}
        </div>
      );
    return null;
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

  render() {
    const { listOpen } = this.state
    return (
      <div className="dropDownMenu">
        <div onClick={this.toggleList.bind(this)} className="menuButton">
          menu
        </div>
        {/* <MakeMenuListF/> */}
        { /**
           * listOpen フラグでメニューが表示されいた(true)
           * の場合だけメニューの内容作成が実行、処理される(if文的)
           */
          listOpen &&
            (<div className="menuBox">
               { /* リストの処理全体の処理を記載  */
                 menuList.map(item => (
                   <div className="menuContent" key={item.name}>
                     <div onClick={this.handleClickMenu.bind(this, item.name)}>{item.title}</div>
                   </div>
                 ))}
             </div>
          )
        }
      </div>
    );
  }
}
 
export default onClickOutside(DropDownMenu)
