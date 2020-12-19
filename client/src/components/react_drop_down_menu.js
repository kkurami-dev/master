/** 
 * 全体で表示するのメニュー
 */
import React from 'react'
import history from '../history';
import onClickOutside from 'react-onclickoutside'

import "../App.css";

class DropDownMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listOpen: false,
    }
  }
 
  toggleList() {
    this.setState(prevState => ({
      listOpen: !prevState.listOpen,
    }))
  }
 
  handleClickMenu(val){
    this.setState({
      listOpen: false,
    })
    //alert(val)
    console.log("menu", val);
    //history.push(val); // 履歴登録ありの画面遷移
    history.replace(val); // 履歴登録なしの画面遷移
  }
 
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
        {listOpen && (
          <div className="menuBox">
            <div className="menuContent">
              <div onClick={this.handleClickMenu.bind(this, '/welcome')}>welcom へ</div>
            </div>
            <div className="menuContent">
              <div onClick={this.handleClickMenu.bind(this, '/hello')}>hello へ</div>
            </div>
            <div className="lastMenuContent">
              <div onClick={this.handleClickMenu.bind(this, '/form')}>form へ</div>
            </div>
            <div className="lastMenuContent">
              <div onClick={this.handleClickMenu.bind(this, '/aws_cwl')}>CloudWatch Logs</div>
            </div>
            <div className="lastMenuContent">
              <div onClick={this.handleClickMenu.bind(this, '/aws_ddb')}>DynamoDB</div>
            </div>
            <div className="lastMenuContent">
              <div onClick={this.handleClickMenu.bind(this, '/aws_kms')}>AWS Key Management Service</div>
            </div>

            <div className="lastMenuContent">
              <div onClick={this.handleClickMenu.bind(this, '/input')}>Reack の入力</div>
            </div>
            <div className="lastMenuContent">
              <div onClick={this.handleClickMenu.bind(this, '/storage')}>Reack ブラウザストーレジ</div>
            </div>
            <div className="lastMenuContent">
              <div onClick={this.handleClickMenu.bind(this, '/eth')}>Web3 Ethereum</div>
            </div>
          </div>
        )}
      </div>
    )
  }
}
 
export default onClickOutside(DropDownMenu)
