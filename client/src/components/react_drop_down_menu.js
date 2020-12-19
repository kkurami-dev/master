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
 
  handleClickMenu(val) {
    this.setState({
      listOpen: false,
    })
    //alert(val)
    console.log("menu", val);
    switch(val){
    case 1: history.push('welcome'); break;
    case 2: history.push('hello'); break;
    case 3: history.push('from'); break;
    case 4: history.push('eth'); break;
    }
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
              <div onClick={this.handleClickMenu.bind(this, 1)}>menu 1</div>
            </div>
            <div className="menuContent">
              <div onClick={this.handleClickMenu.bind(this, 2)}>menu 2</div>
            </div>
            <div className="lastMenuContent">
              <div onClick={this.handleClickMenu.bind(this, 3)}>menu 3</div>
            </div>
            <div className="lastMenuContent">
              <div onClick={this.handleClickMenu.bind(this, 4)}>menu 4</div>
            </div>
            <div className="lastMenuContent">
              <div onClick={this.handleClickMenu.bind(this, 5)}>menu 5</div>
            </div>
          </div>
        )}
      </div>
    )
  }
}
 
export default onClickOutside(DropDownMenu)
