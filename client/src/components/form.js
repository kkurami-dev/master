/** -*- coding: utf-8-unix -*-
 * 
 */
// React 関連モジュール
import React, { Component } from 'react';
import fs from 'fs';

// ローカルのモジュール
import history from '../history';

// 追加機能関連モジュール
const exec = require('child_process').exec;
//const fs = require('fs');
//const mktemp = require('mktemp');
const moment = require('moment');
const pdf = require('html-pdf');
const mkdirp = require('mkdirp');
//const tmp = require('tmp');

// LambdaでサーバーレスにhtmlをPDFに変換しよう
//   https://qiita.com/aosho235/items/ee0ca142949f2a631db2
// htmlをpdfに変換する
function convertAsync(html, pdfFileName) {
  return new Promise(function(resolve, reject) {
    var options = {
      format: 'A4',        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
      orientation: 'portrait', // portrait or landscape
    };

    pdf.create(html, options).toFile(pdfFileName, function(err, res) {
      if (err) {
        reject(err);
      } else {
        resolve({
          filename: res.filename
        });
      }
    });
  });
}

function convertPDF( event, html, out, cb ){
  const fonts = '../configs';

  console.log('input', html, out, fs);
  if (!html || html === '')
    throw new Error('リクエストボディが空です。');
  if (!fs)
    throw new Error('ファイル操作インスタンスがありません。');

  // fontconfigの設定ファイルがあるディレクトリを指定
  process.env['FONTCONFIG_PATH'] = fonts;
  console.log('process.cwd =', process.cwd());

  // キャッシュディレクトリ作成
  let tmpDir;
  //let tmpDir = fs.mkdtempSync(out + '/tmp');
  //let tmpDir = fs.mkdirSync(out);
  fs.mkdir('test', (err) => {
    if (err) { throw err; }
    console.log('testディレクトリが作成されました');
  });
  // tmp.dir(async (err, path, cleanupCallback) => {
  //   console.log(path);
  // });
  //tmpDir = mktemp.createDirSync('XXXXXXXXX');
  // if (!tmpDir || tmpDir === '')
  //   throw new Error('一時ファイル置き場の作成に失敗しました');
  console.log('tmpDir', tmpDir);
  if(1) return;
  const CACHE_DIR = tmpDir + '/fonts-cache';   // fontconfigのキャッシュディレクトリ
  fs.mkdirSync(CACHE_DIR);

  // フォントキャッシュ作成
  exec('fc-cache -v ' + fonts , function(err, stdout, stderr) {
    if (err) {
      console.error(err);
      throw new Error('フォントキャッシュ作成に失敗しました。');
    }

    exec('find /tmp -print', function(err, stdout, stderr) {
      if (err) {
        console.error(err);
        throw new Error('findに失敗しました。');
      }
      console.log(stdout);

      var pdfFileName = tmpDir + '/' + moment().format('YYYYMMDD_HHmmss') + '.pdf';
      convertAsync(html, pdfFileName)
        .then(function(result) {
          console.log('result', result);
        })
        .catch(function(err) {
          console.error(err);
          throw new Error('予期しないエラーが発生しました。');
        });
    });
  });
}

class Form extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url:""
    }
  }

  saveHTML = (event) => {
    console.log(event);
    //convertPDF( event, this.state.url, ".", (e) => {
    let tmp = 'https://web3js.readthedocs.io/en/v1.2.6/web3-eth.html';
    convertPDF( event, tmp, "./out", (e) => {
      console.log(e);
    });
  };

  render() {
    return (
      <div>
        <button onClick={() => history.push('/')}>GoBack</button>
        <p>URL:<br/>
          <textarea type="text" onChange={(e) => this.setState({url: e.target.value})} />
        </p>
        <button className="box" onClick={(e) => this.saveHTML(e)}>
          HTML のPDF保存
        </button>
      </div>
    );
  };
}

export default Form;
