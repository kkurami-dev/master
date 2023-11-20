/** -*- coding: utf-8-unix -*-
 * 
 */
import React, { Component, useState, useEffect, useCallback, useRef, forwardRef} from 'react';
//import ReactCrop from 'react-image-crop';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import ExcelJS from "exceljs";

import Unajyu2 from './image/unajyu.png';
import Unajyu from './image/test.png';
import PlusSolid from './icon/plus-solid.svg';
import EraserSolid from './icon/eraser-solid.svg';
import EqualsSolid from './icon/equals-solid.svg';

import axios from 'axios';
// axios.defaults.baseURL = 'https://4r3ki42pi3.execute-api.ap-northeast-1.amazonaws.com/my-api';
// axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
// axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
//const axios = require("axios").default;
axios.defaults.baseURL = 'https://4r3ki42pi3.execute-api.ap-northeast-1.amazonaws.com/my-api';
// axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
// axios.defaults.headers.post['Content-type'] = 'text/plain';

console.log("---------------------------------------- import Unajyu", Unajyu);

const ExceljsApp = () => {
  const handlerClickDownloadButton = async (
    e,
    format
  ) => {
    e.preventDefault();

    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet("sheet1");
    const worksheet = workbook.getWorksheet("sheet1");

    worksheet.columns = [
      { header: "ID", key: "id" },
      { header: "作成日時", key: "createdAt" },
      { header: "名前", key: "name" }
    ];

    worksheet.addRows([
      {
        id: "f001",
        createdAt: 1629902208,
        name: "りんご"
      },
      {
        id: "f002",
        createdAt: 1629902245,
        name: "ぶとう"
      },
      {
        id: "f003",
        createdAt: 1629902265,
        name: "ばなな"
      }
    ]);

    const uint8Array =
      format === "xlsx"
        ? await workbook.xlsx.writeBuffer() //xlsxの場合
        : await workbook.csv.writeBuffer(); //csvの場合
    const blob = new Blob([uint8Array], { type: "application/octet-binary" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sampleData." + format; //フォーマットによってファイル拡張子を変えている
    a.click();
    a.remove();
  };
  return (
    <>
      <button id="download_xlsx" onClick={(e) => handlerClickDownloadButton(e, "xlsx")}>
        Excel形式
      </button>
      <button id="download_csv" onClick={(e) => handlerClickDownloadButton(e, "csv")}>
        CSV形式
      </button>
    </>
  );
};

async function Sleep(msec){
  //console.log(`${new Date().getSeconds()} 秒`);
  const sleep = (t) => new Promise(resolve => setTimeout(resolve, t))
  await sleep( msec );
  clearInterval(sleep);
  //console.log(`${new Date().getSeconds()} 秒`);
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function BasicModal({isOpen}){
  return (
    <div>
      <Modal
        open={isOpen}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Text in a modal
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
        </Box>
      </Modal>
    </div>
  );  
};

////////////////////////////////////////
function DrawTest({id, type}){
  const [png1, setPng1] = useState(null);
  const [png2, setPng2] = useState(null);

  useEffect(async() => {
    //console.log("useEffect, []");
    // 元画像取得
    let img = await getImagefromCanvas_org("#image1");

    ////////////////////////////////////////
    const size = getSize(type, img, 16, 9);
    //setSize( size_a );
    let { width, height } = 0;
    width = size.w;
    height = size.h;
    //console.log("useEffect, []", size);

    let png;
    // 外枠領域
    const canvasElem = document.createElement('canvas')
    canvasElem.width = width;
    canvasElem.height = height;
    const ctx = canvasElem.getContext('2d')

    // draw
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#888888'
    ctx.fillRect(0, 0, width, height)
    png = canvasElem.toDataURL();

    const canvas = document.createElement('canvas')
    canvas.width = width;
    canvas.height = height;
    const ctx_m = canvas.getContext("2d");
    //console.log("useEffect, png", id, png, canvas);

    // 合成
    const png_i = await getImagefromCanvas(png);
    ctx_m.drawImage(png_i, 0, 0, size.w, size.h);
    await Sleep( 200 );

    //let img2 = await getImagefromCanvas_org("#image1");
    ctx_m.drawImage(img, size.x, size.y, size.W, size.H);
    //console.log("useEffect, png", canvas.toDataURL());
    const png_out = canvas.toDataURL();
    ////////////////////////////////////////

    if(type === 1){
      setPng1(png_out);
    } else {
      setPng2(png_out);
    }
  }, [png1, png2]);

  //console.log("return");
  return (
    <div>
        <div className="comp" style={{ display: 'flex' }}>
          <img src={png1} />
          <img src={png2} style={{ borderRadius: '100%' }} />
        </div>
    </div>
  )
}

////////////////////////////////////////////////////////////////////////////////
// https://note.affi-sapo-sv.com/js-globalcompositeoperation.php
// https://teratail.com/questions/56884
// https://www.otwo.jp/blog/canvas-drawing/
function getSize(type, image){
  let { naturalHeight: h, naturalWidth: w } = image;
  let { naturalHeight: H, naturalWidth: W } = image;
  //console.log("concatCanvas() in data size:", h, w);

  let x = 0, y = 0;//, h = image.height, w = image.width;
  // 例：16:9 にするため、大きなキャンバスを描くための縦、横を決める
  switch( type ){
  case 1:{
    // 横に大きな画像にする(元画像は中央に配置、高さは維持）
    const wp = 16, hp = 9;
    let wb = (h / hp) * wp;
    x = Math.round((wb - w) / 2);
    w = Math.round(wb);
    break;
  }
  case 2:{
    // 高さを調節（横幅を維持し、書き込み先の高さが短くなる）
    const wp = 10, hp = 10;
    h = Math.round((w / wp) * hp);
    //H = h;
    break;
  }
  default:
    return {};
  }
  return {x, y, w, h, W, H};
}  
async function convertImage(type, src, size){
}

function getImagefromCanvas(data){
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = data;
    image.onload = (event) => resolve(image);
    image.onerror = (e) => reject(e);
  });
}
////////////////////////////////////////////////////////////////////////////////

function onFileChange({e, cb}) {
  const files = e.target.files
  if(files.length > 0) {
    var file = files[0]
    var reader = new FileReader()
    reader.onload = (e) => cb(e.target.result )
    reader.readAsDataURL(file)
  } else {
    this.setState({ imageData: null })
  }
}

/**
 * [onload] うな重の画像を描画
 */
function drawImage1(){
  const Unaju = new Image();
  Unaju.src = Unajyu;
  Unaju.onload = () =>{
    const canvas = document.querySelector("#image1");
    const ctx = canvas.getContext("2d");
    ctx.drawImage(Unaju, 0, 0, canvas.width, canvas.height);
  }
}

/**
 * [onload] テキスト「うな重」を描画
 */
function drawImage2(){
  const canvas = document.querySelector("#image2");
  const ctx = canvas.getContext("2d");
  ctx.font = "32px serif";
  ctx.fillStyle = "Red";
  ctx.fillText("重", 45, 150);
}

/**
 * Canvas合成
 *
 * @param {string} base 合成結果を描画するcanvas(id)
 * @param {array} asset 合成する素材canvas(id)
 * @return {void}
 */
async function concatCanvas_org(base, asset){
  const canvas = document.querySelector(base);
  const ctx = canvas.getContext("2d");

  const image1 = await getImagefromCanvas_org(asset[0]);
  //console.log("image1", image1);
  ctx.drawImage(image1, 0, 0, canvas.width, canvas.height);

  const image2 = await getImagefromCanvas_org(asset[1]);
  //console.log("image2", image2);
  ctx.drawImage(image2, 0, 0, canvas.width, canvas.height);
}

/**
 * Canvasをすべて削除する
 *
 * @param {string} target 対象canvasのid
 * @return {void}
 */
function eraseCanvas(target){
  const canvas = document.querySelector(target);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Canvasを画像として取得
 *
 * @param {string} id  対象canvasのid
 * @return {object}
 */
function getImagefromCanvas_org(id){
  return new Promise((resolve, reject) => {
    const image = new Image();
    const ctx = document.querySelector(id).getContext("2d");
    image.src = ctx.canvas.toDataURL();
    image.onload = () => resolve(image);
    image.onerror = (e) => reject(e);
    //console.log("canvas.toDataURL", ctx.canvas.toDataURL());
  });
}

const url_top = 'https://api1.kkurami2.link/m';
//const url_top = 'https://api1.kkurami2.link';
//const url_top = 'https://ddatrct9uxrny.cloudfront.net';
//const url_top = 'https://6rldbeodsf.execute-api.ap-northeast-1.amazonaws.com/';
//const url_top = 'https://4r3ki42pi3.execute-api.ap-northeast-1.amazonaws.com/my-api';
async function axios_test1() {
  //const server = url_top + '/test2';
  const server = '/login';
  let headers = {
    //accept:"*/*",
    'Content-Type': "application/json",
    'Access-Control-Allow-Origin': 'http://localhost:3000',
  };
  let data =  {
      "func":"login",
      "userId":"test_user01",
      "userPassword":"TestUser01@",
      "call":"react",
  };
  await axios.post(server, data, headers)
    .then((res) => { console.log("server", res.data); })
    .catch(console.error);
}

export default class DetaDetail extends  Component {
  constructor(props) {
    super(props);
    //console.log("param", props);
    this.state = {
      draw: false,
      displayedImages: [],
      age:0,
      modal: false,
    };
  }

  handleChange = (event) => {
    this.setState({age: event.target.value});
  };

  componentDidMount = async () => {
    await axios_test1();
    
    // #image1に画像を描画
    drawImage1();

    // #image2にテキストを描画
    drawImage2();

    // 「+」ボタンを押したら合成
    document.querySelector("#btn-concat1").addEventListener("click", async ()=>{
      console.log('querySelector s');
      this.setState({modal:true});
      await concatCanvas_org("#concat", ["#image1", "#image2"]);
      await Sleep( 3000 );
      this.setState({draw: true, modal:false});
      console.log('querySelector e');
    });

    // 「消しゴム」ボタンを押したらクリア
    document.querySelector("#btn-eraser").addEventListener("click", ()=>{
      eraseCanvas("#concat");
    });
  }

  handleChangeImg = (event) => {
    const formatFileSize = (bytes, decimalPoint) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1000
      const dm = decimalPoint || 2
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
    }

    if (event.currentTarget.files != null) {
      const files = event.currentTarget.files
      let displayedImages = 
          Array.from(files).map((file) => {
            return {
              url: window.URL.createObjectURL(file),
              size: formatFileSize(file.size, 1),
            }
          });
      this.setState({displayedImages});
    }
  }

  render() {
    const {img3, img4, displayedImages, age, modal} = this.state;
    return (
      <div>
        <BasicModal isOpen={modal} />
        <ExceljsApp/>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Age</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={age}
            label="Age"
            onChange={this.handleChange}
          >
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
          </Select>
        </FormControl>
        
        <div className="flex-container">
          <img src={Unajyu} />
          <div className="div_img">
            <img src={Unajyu}/>
          </div>

        <div >
          <input type="file"
                 id="xlsx-input"
                 onChange={this.handleChangeImg}
                 accept="xlsx/*"
          />
          <input type="file"
                 id="img-input"
                 onChange={this.handleChangeImg}
                 accept="image/*"
                 multiple={true} />
          <ul>
            {displayedImages && displayedImages.map((displayedImage, index) => {
              return (
                <li key={`${index}-li`}>
                  <img src={displayedImage.url} alt="" key={`${index}-img`} id={`${index}-img`} />
                  <p>{displayedImage.size}</p>
                </li>
              )
            })}
          </ul>
        </div>

        </div>
        <div className="flex-container">
          <canvas id="image1" width="92" height="128" />
          <img src={PlusSolid} width="32" height="32" />
          <canvas id="image2" width="200" height="170" />
            <button type="button" id="btn-concat1" >
              <img src={EqualsSolid} width="32" height="32" />
            </button>
          <canvas id="concat" width="200" height="170" />
        </div>

        <button type="button" id="btn-concat2">
          <img src={EqualsSolid} width="32" height="32" />
        </button>
        <button type="button" name="btn-concat3">
          <img src={EqualsSolid} width="32" height="32" />
        </button>
        <p id="eraser">
          <button type="button" id="btn-eraser">
            <img src={EraserSolid} width="32" height="32" />
          </button>
        </p>

        <DrawTest id="image3" type={1}/>
        <DrawTest id="image4" type={2}/>
      </div>
    );
  }
}
