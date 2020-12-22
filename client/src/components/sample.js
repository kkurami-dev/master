import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root') //任意のアプリを設定する　create-react-appなら#root
class ModalWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false,
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

    /* 非表示中に親コンポーネントからの表示指示に対応 */
    if (!this.state.modalIsOpen && modalIsOpen)
      this.setState({modalIsOpen: true});

    /* 表示中に親コンポーネントからの非表示指示に対応 */
    if (this.state.modalIsOpen && !modalIsOpen)
      this.setState({modalIsOpen: false});

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

  closeModal(event) {
    event.stopPropagation();
    console.log("closeModal()", event.target.name);
    let {modalNotClose, modalCallBack} = this.props;

    // 手動クローズしないフラグに従い閉じない
    if (modalNotClose) return;
    // クローズボタンが以外からのクローズには従わない
    if (!event.target.name) return;
    // クローズした事を親コンポーネントに通知
    if(modalCallBack) modalCallBack( false );
    // isOpen フラグを落とし非表示にする
    this.setState({modalIsOpen: false});
  }

  render() {
    console.log("render()");
    let {modalNotClose} = this.props;
    return (
      <div>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          contentLabel="Example Modal"
          className="Modal"
          overlayClassName="Overlay"
          backdrop={'static'}
          keyboard={ false }
          data-keyboard={false}
        >
          <h2 ref={subtitle => this.subtitle = subtitle}>ModalWindow</h2>
          <div>Opend</div>
          {!modalNotClose && <button onClick={this.closeModal} name="close">閉じる</button>}
        </Modal>
      </div>
    );
  }
}
export default ModalWindow;
