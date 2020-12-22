import React from 'react';
import Modal from 'react-modal';
const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

Modal.setAppElement('#root') //任意のアプリを設定する　create-react-appなら#root
class ModalWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false
    };
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

  }
  componentDidMount() {
    console.log("props", this.props);
    let {modalIsOpen, modalCallBack} = this.props;
    this.setState({modalIsOpen, modalCallBack});
  }
  /**
   * React.Component のマニュアル
   *   https://ja.reactjs.org/docs/react-component.html
   */
  componentDidUpdate(){
    console.log("componentDidUpdate()", this.state.modalIsOpen, this.props);
    let {modalIsOpen, modalCallBack} = this.props;
    /* 表示中に親コンポーネントからのクローズ指示に対応 */
    if (!this.state.modalIsOpen && modalIsOpen){
      this.setState({modalIsOpen: true});
    }
    /* 表示中に親コンポーネントからのクローズ指示に対応 */
    if (this.state.modalIsOpen && !modalIsOpen){
      this.setState({modalIsOpen: false});
    }

    // スタックを取得
    // var obj = {};
    // Error.captureStackTrace(obj);
    // console.log(obj.stack);
  }
  openModal() {
    this.setState({modalIsOpen: true});
  }
  afterOpenModal() {
    this.subtitle.style.color = '#f00';
  }
  closeModal() {
    this.state.modalCallBack( false );
    this.setState({modalIsOpen: false});
  }
  render() {
    console.log("render()");
    return (
      <div>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <h2 ref={subtitle => this.subtitle = subtitle}>ModalWindow</h2>
          <div>Opend</div>
          <button onClick={this.closeModal}>close</button>
        </Modal>
      </div>
    );
  }
}
export default ModalWindow;
