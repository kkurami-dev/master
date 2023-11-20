/**  -*- coding: utf-8-unix -*-
 *
 * データの内容をリストする
 *
 * きも：react-loops
 *     node_modules/react-loops/README.md
 * 参考ページ
 *   react-loopsでReactのリスト表示を美しく簡潔に書く
 *   https://qiita.com/taneba/items/fdb2d4cfb85d8ef5fdf3
 */
import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextareaAutosize from '@mui/material/TextareaAutosize';
//import { For } from 'react-loops';
// import 'react-widgets/dist/css/react-widgets.css';
// //import DropdownList from 'react-widgets/lib/DropdownList';
// import { DropdownList } from 'react-widgets';
//import DropdownList from '../lib/DropdownList';
//import QRCodeR from "qrcode.react";
//import { QRCodeImg } from '@cheprasov/react-qrcode';
//import QRCode from "qrcode.react";
//import { useQRCode } from 'next-qrcode';
//import QRCode from 'react-qr-code';
import QRCode from 'qrcode';
import JSZip from "jszip";

import "../App.css";
import history from '../history';

//const QRCode = require("qrcode");

/** リスト項目(DynamoDB や json でファイルにしてもよい) */
let itemList = [
  {name:"/welcom",  title:"welcom3 へ"},
  {name:'/hello',   title:"hello へ"},
  {name:"/form",    title:"form へ"},
  {name:"/aws_cwl", title:"CloudWatch Logs"},
  {name:"/aws_ddb", title:"DynamoDB"},
  {name:"/aws_kms", title:"AWS Key Management Service"},
  {name:"/input",   title:"Reack の入力"},
  {name:"/storage", title:"Reack ブラウザストーレジ"},
  {name:"/eth",     title:"Web3 Ethereum"},
  {name:"/welcom3",  title:"welcom へ"},
  {name:'/hello',   title:"hello へ"},
  {name:"/form",    title:"form へ"},
  {name:"/aws_cwl", title:"CloudWatch Logs"},
  {name:"/aws_ddb", title:"DynamoDB"},
  {name:"/aws_kms", title:"AWS Key Management Service"},
  {name:"/input",   title:"Reack の入力"},
  {name:"/storage", title:"Reack ブラウザストーレジ"},
  {name:"/eth",     title:"Web3 Ethereum"},
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

const style = {
  maxWidth: "40px",       // 数値は"64px"のように、pxとして扱われます
  //maxHeight: "40px",
  maxHeight: "auto",  /* 高さは自動指定 */
  borderRadius: 4,
  border: "none",
  padding: "10px 16px",
  color: "#fff",
  background: "#639",
  width: "50%",
  margin:"0 auto",
  //overflow: 'hidden',// はみ出したら表示しない
  '&:hover':{
    color: "#fff",
    background: "#fff",
  },
};
const style_hover = {
  //visibility: 'hidden', // 領域は残す
  display: 'none',// 領域も消える
  //position: 'absolute',
  size:256,
  ...style,
};

function QRcodeImage({id}){
  // https://www.npmjs.com/package/qrcode
  let name = `qr-gen_${id}`;
  let value = "https://github.com/cheprasov/ts-react-qrcode/" + id;
  
  const size = 264;
  const qr_options = {
    type: 'image/png',
    quality: 0.95,
    level: 'M',
    margin: 3,
    scale: 4,
    size,
    width: size,
    height: size,
  };
  let qr_options_h = {
    size: 70,
    width: 70,
    height: 70,
  };

  return (
    <div>
      <div style={style_hover}>
        <QRCodeCanvas
          id={name}
          value={value}
          options={qr_options}
        />
      </div>
      <div style={style}>
        <QRCodeCanvas
          value={value}
          options={qr_options_h}
        />
      </div>
    </div>);
}

function QRCodeCanvas2( unit ){
  return null;
}
function QRCodeCanvas( unit ){
  let text = unit.value,
      opt = unit.options,
      def = React.useRef( null );
  const { size, id, name, key } = unit;
  let param = {
    id,
    name,
    key,
  };

  const ef = React.useEffect((
    function(){
      //console.log('QRCodeCanvas Effect', def);
      def && def.current && QRCode.toCanvas(
        def.current,
        text,
        opt,
        (function( err ){ if( err ) throw err })
      );
    }
  ), [ text, opt, def ]);
  React.useMemo(( function(){ return ef }), []);

  const elem = React.createElement( "canvas", { ref: def, ...param });
  return elem;
}

/**
 * Base64とMIMEコンテンツタイプからBlobオブジェクトを作成する。
 * 日本語対応。
 * 
 * @param base64 
 * @param mime_ctype MIMEコンテンツタイプ
 * @returns Blob
 */
function toBlob(base64, mime_ctype) {
  // 日本語の文字化けに対処するためBOMを作成する。
  var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  
  var bin = atob(base64.replace(/^.*,/, ''));
  var buffer = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) {
    buffer[i] = bin.charCodeAt(i);
  }
  // Blobを作成
  try {
    var blob = new Blob([bom, buffer.buffer], {
      type: mime_ctype,
    });
  } catch (e) {
    return false;
  }
  return blob;
}

export default class DataList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listOpen: false,
      search:[{}],
      items:    [{name:'name', id:0}, {name:'title',id:1}], /** この項目は固定なので json などから読み込んだり */
    }
  }

  /** フィルターの指定と判定 
   *    配列操作: https://www.sejuku.net/blog/22295
   */
  /**
   * 検索項目の追加
   */
  addSearch = (e) => {
    let search = this.state.search;
    search.unshift({word:"", row:""});
    this.setState({ search });
  }
  /**
   * 検索項目の削除
   */
  delSearch = (e, val) => {
    let search = this.state.search;
    //console.log(e.target.value, val);
    search.splice(val, 1);
    this.setState({ search });
  }
  /**
   * 検索項目の内容を設定
   */
  setSearch = (val, key, v) => {
    console.log("setSearch()", val, key, v);
    if(v){
      //console.log(v.originalEvent.currentTarget());
    }

    let ret_val;
    let search = this.state.search;
    if(val.target) {
      search[key].word = val.target.value;
      ret_val = val.target.value;
    } else {
      search[key].row = val.name;
      ret_val = val.name;
    }
    this.setState({ search });
    return ret_val;
  }
  /**
   * 検索項目に従って、リストを表示/非表示の判定を実施
   *   e.name === e[ 'name ' ] が同じ意味の為
   */
  filter = (e) => {
    //console.log("input", e);
    let search = this.state.search;
    for(let i = 0; i < search.length; i++ ){
      let elm = search[i];
      if ( !elm.row || !elm.word ) continue;
      //  例：e.name.indexOf( 'aws ' ) のような評価を行っている
      if ( e[elm.row].indexOf( elm.word ) === -1) return false;
    }
    return true;
  }

  /**
   * リストの選択時の処理
   */
  item_edit = (e) => {
    let val = e.target.name;
    console.log("data", val);
    history.push({ pathname: '/detail', state: { talbe:1, ...itemList[val] }});// 遷移先とパラメータを指定
  }
  item_delete = (e) => {
    let val = e.target.name;
    console.log("data", val);
    history.push({ pathname: '/detail', state: { talbe:1, ...itemList[val] }});
  }

  item_hello = (e) => {
    history.push({ pathname: '/hello',
                   state: { }
                 });// 遷移先とパラメータを指定
  }
  ListDataKey = (a, b, c, d) => {
    console.log("ListDataKey()", a, b, c, d);
    return a.item.name;
  }

  SelectItem = (item) => {
    console.log("SelectItem()", item);
    // return (
    //   <span>
    //     <strong>{item.id}</strong>
    //     {" " + item.name}
    //   </span>
    // )
    this.setState({ select_item: item });
  };

  zipMakae = () => {
    const files = [
      "qr-gen_011",
      "qr-gen_012",
      "qr-gen_013",
    ];
    const down_ret = files.map( image => this.downloadQRCode( image));
    Promise.all( down_ret );

    this.zipMakae_sub( down_ret );
  }

  zipMakae_sub = ( images ) => {
    const zip = new JSZip();

    // フォルダ作成
    const folderName = "qrcodes";
    let folder = zip.folder(folderName);

    // フォルダ下に画像を格納
    images.forEach(image => {
      if (image.data && image.fileName) {
        folder.file(image.fileName, image.data)
      }
    });

    // zip を生成
    zip.generateAsync({ type: "blob" }).then(blob => {

      // ダウンロードリンクを 生成
      let dlLink = document.createElement("a");

      // blob から URL を生成
      const dataUrl = URL.createObjectURL(blob);
      dlLink.href = dataUrl;
      dlLink.download = `${folderName}.zip`;

      // 設置/クリック/削除
      document.body.insertAdjacentElement("beforeEnd", dlLink);
      dlLink.click();
      dlLink.remove();

      // オブジェクト URL の開放
      setTimeout(function() {
        window.URL.revokeObjectURL(dataUrl);
      }, 1000);
    });
  }

  downloadQRCode = ( name, set_cb ) => {
    // Generate download with use canvas and stream
    const canvas = document.getElementById(name);
    if(!canvas) return {};

    const mime_ctype = "image/png";
    const pngUrl = canvas
          .toDataURL(mime_ctype)
          .replace(mime_ctype, "image/octet-stream");

    const byteString = atob( pngUrl.split( "," )[1] ) ;

    // バイナリからBlobを作成
    const size = byteString.length;
    let content = new Uint8Array( size );
    for( let i = 0; size > i; i++ ) {
	    content[i] = byteString.charCodeAt( i ) ;
    }

    // ファイルとファイル名のデータ返却
    var blob = new Blob( [ content ], {
	    type: mime_ctype,
    } ) ;
    return {data:blob, fileName: `${name}.png`};
  };

  render() {
    let search = this.state.search;
    let data = this.state.items;
    // let select_item = this.state.select_item;
    return (
      <div>
        <button type="button" onClick={this.zipMakae}>Download QR Code3</button>
        <br/>
        <button type="button" onClick={this.item_hello}>Web3 テスト</button>
        <br/>
        <QRcodeImage id="011"/>
        <QRcodeImage id="012"/>
        <QRcodeImage id="013"/>
        <br/>
        <br/>
        <table className="type06">
          <thead>
            <tr><th>検索条件指定</th></tr>
          </thead>
          <tbody>
            {search.map((item, idx) => (
              idx === search.length
                ? (<tr key={idx}>
                     <td colSpan="2"></td>
                     <td><button onClick={e => this.addSearch(e)}>検索条件の追加</button></td>
                   </tr>)
                : (<tr key={idx}>
                     <td>
                       <FormControl fullWidth>
                         <InputLabel id="demo-simple-select-label">列</InputLabel>
                         <Select
                           labelId="filter-select-label"
                           id="filter-select"
                           label="列"
                           value={''}
                           onChange={(e, v)=> this.setSearch(e, idx, v)}
                         >
                           {data.map((item, idx) => (
                             <MenuItem value={idx} key={item.id}>
                               {item.name}
                             </MenuItem>)
                                    )}
                         </Select>
                       </FormControl>
                     </td>
                     <td>内容:
                       <TextareaAutosize
                         type="text"
                         id={"text_"+ search[idx].word}
                         value={search[idx].word}
                         onChange={e => this.setSearch(e, idx)}
                       />
                     </td>
                     <td><button onClick={e => this.delSearch(e, {idx})}>削除</button></td>
                   </tr>
                  )))
            }
          </tbody>
        </table>
        <br/>
        <table className="type06">
          <thead>
            <tr>
              <th>位置</th>
              <th>名前(name)</th>
              <th>タイトル(title)</th>
              <th colSpan="2" >操作</th>
            </tr>
          </thead>
          <tbody>
            {itemList.map(
              (item, key) => this.filter(item)
                && (
                  <tr key={key}>
                    <td>{key}{key === itemList.length && '(最後)'}</td>
                    <td>{item.name}</td>
                    <td>{item.title} </td>
                    <td><button onClick={this.item_edit} name={key}>編集</button></td>
                    <td><button onClick={this.item_delete} name={key}>削除</button></td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    );
  }
}
