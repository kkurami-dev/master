import React, { Component } from 'react';

class Hello extends  Component {
  /**
   * 文字入力のサンプル
   * input の onChange 内容の変更契機に呼ばれ、
   * その input に設定( target )されている属性で更新対象の判断や、値の取得を行う
   * 
   */
  handleOnChange = (e) => {
    let data = this.state.data;
    //console.log(e);
    //console.log(e.target);
    switch(e.target.name){
    case "1": data.val1 = e.target.value; break;
    case "2": data.val2 = e.target.value; break;
    }
    this.setState({ data });
    //this.setState({ some_code: e.target.value });
  };

  doSomething = () =>{
  }

  render() {
    return (
      <div>
        <p>ここに入力①
          <input type="text" name="1" value={data.val1} onChange={e => this.handleOnChange(e)} />
        </p>
        <p>ここに入力②
          <input type="text" name="2" value={data.val2} onChange={e => this.handleOnChange(e)} />
        </p>
        <div>
          <input type="submit" value="確定" onClick={() => this.doSomething()} />
        </div>
      </div>
    );
  }
}

export default Hello;
