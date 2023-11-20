"use strict";
const TimeStamp = 'Time-stamp: <2023-09-29 23:28:47 kuramitu>';
import { Buffer } from 'node:buffer';
import {
  // brotliCompressSync,
  // brotliDecompressSync,
  // deflateSync,
  // inflateSync,
  gzipSync,
  unzipSync,
} from 'zlib';
// import zlib from 'zlib';
//import * as fflate from 'fflate';
// import * as fflate from 'fflate/esm';
import {randomFillSync} from 'node:crypto';

import base122 from './Base122.mjs';

const S="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

//var exec = require('child_process').exec;

/**
 * 圧縮
 */
function gzip(data){
  const str = JSON.stringify( data );
  //const content = base122.encode(str);
  //const content = encodeURIComponent(str); // エンコード
  //const result = gzipSync(content);   // 圧縮
  const result = gzipSync(str);   // 圧縮
  const value2 = result.toString('base64'); // Buffer => base64変換
  const value = base122.encode(result);
  return {value, value2};
}

/**
 * 解凍
 */
function unzip(value){
  const buffer = Buffer.from(value, 'base64');              // base64 => Bufferに変換
  const result = unzipSync(buffer);                    // 復号化
  const str = decodeURIComponent(result).toString('utf-8'); // デコード

  const ret = JSON.parse( str );
  return ret;
}

/* ランダム文字列作成 */
function getStr(N){
  return Array.from(randomFillSync(new Uint8Array(N))).map((n)=>S[n%S.length]).join('');
}
function getsize(data){
  const str = JSON.stringify( data );
  console.log( "str lenght:", str.length);
  // Max 6291556 bytes
  //     6178331
  //     6178483
  return str.length;
}

export const handler = async (event) => {
  const {
    //  無圧縮での最大: 10744 ( 圧縮率 84% ), 3秒
    // qip圧縮での最大: 18690 ( 圧縮率 78% ), 30秒
    // deflate圧縮での最大: 18690 ( 圧縮率 83% ), 30秒
    offset = 10744,
    zip = 0,
  } = event;

  //const max = 6 * 1024 * 10 + 1475; // 平文最大最大サイズ
  const max = 6 * 1024 * 5 + offset;
  let buf = {};
  for(let i = 0; i < max; i++){
    //buf = buf + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    const key = getStr(16);
    const val = getStr(100);
    buf[ key ] = {val, i, max};
  }
  const base = getsize(buf);

  let str1 = "";
  if( zip === 1 ){
    const {value, value2} = gzip(buf);
    const gsize1 = getsize({value});
    const gsize2 = getsize({value2});
    console.log("qzip size1:", base, gsize1, ((gsize1 / base) * 100).toFixed(2) );
    console.log("qzip size2:", base, gsize2, ((gsize2 / base) * 100).toFixed(2) );
    str1 = value2;

  } else {
    str1 = buf;
  }

  const response = {
    statusCode: 200,
    body: str1,
  };
  console.log( TimeStamp );
  return response;
};
