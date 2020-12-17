import React from 'react'
import onClickOutside from 'react-onclickoutside'
 
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
    alert(val)
  }
 
  handleClickOutside() {
    this.setState({
      listOpen: false,
    })
  }
 
  render() {
    const { listOpen } = this.state
    return (
      <div style={styles.dropDownMenu}>
        <div onClick={this.toggleList.bind(this)} style={styles.menuButton}>
          menu
        </div>
        {listOpen && (
          <div style={styles.menuBox}>
            <div style={styles.menuContent}>
              <div onClick={this.handleClickMenu.bind(this, 1)}>menu 1</div>
            </div>
            <div style={styles.menuContent}>
              <div onClick={this.handleClickMenu.bind(this, 2)}>menu 2</div>
            </div>
            <div style={styles.lastMenuContent}>
              <div onClick={this.handleClickMenu.bind(this, 3)}>menu 3</div>
            </div>
          </div>
        )}
      </div>
    )
  }
}
 
const styles = {
  dropDownMenu: {
    position: 'relative',
  },
  menuButton: {
    display: 'inline',
    cursor: 'pointer',
    border: '1px solid black',
    padding: '3px 5px',
  },
  menuBox: {
    position: 'absolute',
    top: '23px',
    width: '120px',
    zIndex: 1,
    cursor: 'pointer',
    border: '1px solid black',
  },
  menuContent: {
    padding: '3px 5px',
    borderBottom: '1px solid black',
  },
  lastMenuContent: {
    padding: '3px 5px',
  },
}
 
export default onClickOutside(DropDownMenu)
