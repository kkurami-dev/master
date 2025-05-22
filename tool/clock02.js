"use strict";
/**
 * JavaScript, Node.js, React, AWS Lambda を作成する参考のため、
 * 自己啓蒙・研究・検証を行う 時計・カレンダーの JavaScript。
 * こてこての Javascript で外部ライブラリは使わずに作成している。
 *
 * 概要
 *   HTML は JQuery で部品配置のためのキー、処理はほとんどこのスクリプトで実施
 *   装飾はなるべく CSS で行う(クラスやIDのみ設定)。
 *
 * 参考URL
 *    時計：https://techlife.asahi.com/n/n6e0eb40e78d5
 *    カレンダー：https://qiita.com/kan_dai/items/b1850750b883f83b9bee
 *    日本の休日：https://holidays-jp.github.io/
 *    円グラフ：https://fuuno.net/ani/ani89/circle_graph.html
 *      タイマーの残り時間表示に使用
 *    IndexedDB：https://qiita.com/butakoma/items/2c1c956b63fcf956a137
 *      各種データ保存
 *    PageSpeed Insights
 *      ホームページの速度などの評価をしてくれる
 *
 * JavaScript の圧縮、難読化
 *   > npm install -g npm
 *   > npm install terser -g
 *   > terser clock02.js -m -c > temp.js
 *   > javascript-obfuscator temp.js --output .clock02-pack.js --compact true --control-flow-flattening true
 *
 *   圧縮  :terser
 *   難読化:javascript-obfuscator
 *         https://qiita.com/u83unlimited/items/970f819d1fafa325bfbf
 *
 */
const DB_VERSION = 3;
const SVG_NS = "http://www.w3.org/2000/svg";
const config = {
  // 稼働時間
  workStart : { hours: 8, minutes: 0.5 },// 作業開始時間 8.5 = 8:30
  // 休日やイベント設定
  ccHday:{
    "2025-04-28": {title:"有休消化日",                     type:1},
    "2025-04-30": {title:"有休奨励日(アニバーサリー休暇)", type:2},
    "2025-05-01": {title:"有休奨励日(アニバーサリー休暇)", type:2},
    "2025-05-02": {title:"有休奨励日(アニバーサリー休暇)", type:2},
    "2025-08-12": {title:"夏季休日",                       type:3},
    "2025-08-13": {title:"夏季休日",                       type:3},
    "2025-08-14": {title:"夏季休日",                       type:3},
    "2025-08-15": {title:"有休消化日",                     type:1},
    "2025-09-22": {title:"有休奨励日(アニバーサリー休暇)", type:2},
    "2025-12-29": {title:"有休消化日",                     type:1},
    "2025-12-30": {title:"年末年始休",                     type:3},
    "2025-12-31": {title:"年末年始休",                     type:3},
    "2026-01-02": {title:"年末年始休",                     type:3},
  },
  nesHday:{
  },
  myHday:{
  },

  // その他設定
  show: 3,

  // 状態
  nowWeekNum: 0,
  lastUpdate: {},
  lastSeconds: -2,
  lastAngle: 0,
  iH: null,
  timerParam: {},
}
const weeks = ['日', '月', '火', '水', '木', '金', '土'];
const message = document.getElementsByClassName("message")[0];

/*********************************************************************************
 * ライブラリー関連
 *********************************************************************************/
function isSmartPhone() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  let result = false;
  if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
    message.innerHTML += " phone";
    result = true;

    try {
      const orientation = screen.orientation;
      orientation.lock('landscape');
    } catch (error) {
      console.error('画面の向きを固定できませんでした: ', error);
    }
  } else {
    message.innerHTML += " pc";
  }
  message.innerHTML += ` ${w}x${h}`;

  const body_element = document.getElementsByTagName('body')[0];
  if(w < h){
    body_element.style.setProperty("--clocksize", w * 0.87 + "px");
  } else {
    body_element.style.setProperty("--clocksize", h * 0.87 + "px");
  }
  return result;
}

function initDB( param = {} ){
  if(param.db) return;
  
  const {
    dbName = 'sampleDB1',
    dbStore = 'sampleStore2',
    func,
  } = param;

  // DB名を指定して接続。DBがなければ新規作成される。
  let openReq  = indexedDB.open(dbName, DB_VERSION );
  openReq.onupgradeneeded = function reqUpGrade(event){
    // onupgradeneededは、DBのバージョン更新(DBの新規作成も含む)時のみ実行
    const db = event.target.result;

    // オブジェクトストア作成
    const store = db.createObjectStore(dbStore, {keyPath : 'id'});
    //const store = db.createObjectStore(dbStore, {keyPath : 'id', autoIncrement: true});
    // store.createIndex('dataKey', 'dataKey', { unique: true });
    // store.createIndex('title', 'title', { unique: false });
    // store.createIndex('type', 'type', { unique: false });
  }
  openReq.onsuccess = function actMng(event){
    // onupgradeneededの後に実行。更新がない場合はこれだけ実行
    const db = event.target.result;
    
    if(func){
      func( { dbName, dbStore,  ...param, db, } );
      return;
    }

    db.close();
  }
  openReq.onerror = function(event){
    console.error('db open');
  }
}
function mngDB( param ){
  let store = null;
  const typeMap = {
    1:{ f: "readwrite", e: (p) => store.add(p) },
    2:{ f: "readwrite", e: (p) => store.put(p) },
    3:{ f: "readonly", e: (p) => store.get(p) },
    4:{ f: "readonly", e: (p) => store.getAll(p) },
    5:{ f: "readwrite", e: (p) => store.delete(p) },
  };
  const tF = typeMap[ param.type ];
  if(!param.db){
    param.func = mngDB;
    initDB(param);
    return;
  }

  const {data, db, dbStore, successCB, compCB } = param;
  const trans = db.transaction(dbStore, tF.f );
  store = trans.objectStore(dbStore);
  const mngReq = tF.e(data);
  mngReq.onsuccess = function(event){
    param.event = event;
    param.result = event?.target?.result;
    if(successCB) successCB( param );
  }
  trans.oncomplete = function(cmp){
    param.cmp = cmp;
    if(compCB) compCB( param );
    else db.close();
  }
}
// data = { id : 'A1', name : 'test'};
function addDB( param = {} ){
  param.type = 1;
  mngDB( param );
}
function putDB( param = {} ){
  param.type = 2;
  mngDB( param );
}
function getDB( param = {} ){
  param.type = 3;
  mngDB( param );
}
function getAllDB( param = {} ){
  param.type = 4;
  mngDB( param );
}
function delDB( param = {} ){
  param.type = 5;
  mngDB( param );
}

function SetEv(inObj) {
  const { id, key, func, tHandle } = inObj;
  if(tHandle){
    clearTimeout( tHandle );
    inObj.tHandle = undefined;
  }
  
  const el = document.getElementById(id);
  if(el){
    el.addEventListener(key, func);
  } else {
    inObj.tHandle = setTimeout(SetEv, 20, inObj);
  }
}

function MakeTable(obj) {
  const {body, data, cb} = obj;
  // テーブルを作成
  const table = document.createElement('table');
  table.border = '1'; // 枠線をつける（オプション）

  // 行とセルを作成
  for (let i = 0; i < data.length; i++) {
    const row = document.createElement('tr');

    for (let j = 0; j < data[i].length; j++) {
      const cell = document.createElement('td');
      // cell.textContent = data[i][j]; // セルの中身を設定
      if(cb) cb(i, j, cell, data[i][j]);
      row.appendChild(cell); // 行にセルを追加
    }

    table.appendChild(row); // テーブルに行を追加
  }

  // テーブルを body に追加
  body.appendChild(table);  
}

/*
function reloadClock(){
  // JavaScript でページをリフレッシュする方法 – JS でページを再読み込みする方法
  // https://www.freecodecamp.org/japanese/news/javascript-refresh-page-how-to-reload-a-page-in-js/
  //location.reload();
  location.reload(true);
  //location.replace();
  // location.href = location.href;
}
*/
function getNowDay(today = new Date(), outP = {}) {
  // 年・月・日・曜日を取得
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const day = today.getDay();
  const sec = today.getSeconds();
  const msec = today.getTime();
  const hour = today.getHours();

  Object.assign(outP, {year, month, date, day, msec, sec, hour});
  /*      0     1      2     3    4     5    6 */
  return [year, month, date, day, msec, sec, hour];
}

function isNowWeerk(month, day, now){
  const nowDay = getNowDay(now);
  const wday = nowDay[2] - day;
  if(month === nowDay[1] && nowDay[3] === wday){
    return true;
  }
  return false;
}

function isNowDay(month, day, now){
  const nowDay = getNowDay(now);
  if(month === nowDay[1] && day === nowDay[2]){
    return true;
  }
  return false;
}

/*********************************************************************************
 * カレンダー関連
 *********************************************************************************/
function setWeek(month, day, now, obj) {
  const welStr = `mcw-${obj.weekNo}`;
  obj.weekNo += 1;

  if(obj.calendarHtml){
    if(isNowWeerk(month, day, now)){
      obj.calendarHtml += `<tr class="now-week" id="${welStr}">`;
    } else {
      obj.calendarHtml += `<tr id="${welStr}">`;
    }
  } else {
    // 描画済み部品の更新
    const el = document.getElementById(welStr);
    const cll = el.classList;
    let cl = "";
    cll.forEach(key => {
      cll.remove(key);
    });
    if(isNowWeerk(month, day, now)){
      cll.add("now-week");
    }
  }
}

function setDay(obj, w, d) {
  let {
    year, month
  } = obj
  const {
    now, 
    dayCount,
    endDayCount,
    lastMonthendDayCount,
    startDay,
    dayNo,
  } = obj;
  let num = dayCount;
  let cl = "calendar_td";
  let ret = 1;

  if (w == 0 && d < startDay) {
    // 1行目で1日の曜日の前
    num = lastMonthendDayCount - startDay + d + 1;
    cl = "is-disabled";
    ret = 0;
    month -= 1;
  } else if (dayCount > endDayCount) {
    // 末尾の日数を超えた
    num = dayCount - endDayCount;
    cl = "is-disabled";
    if(month === 12){
      year += 1;
      month = 1;
    } else {
      month += 1;
    }
  } else if (isNowDay(month, dayCount, now)){
    config.nowWeekNum = w;
    cl = "now-day";
  }

  const ydm = `${year}-${month}-${num}`;
  const dd = `mcdd-${dayNo}`;
  if(obj.calendarHtml){
    obj.calendarHtml += `<td class="${cl}" id=${dd} data-date="${ydm}">${num}</td>`;
  } else {
    // 描画済み部品の更新
    const el = document.getElementById(`mcdd-${dayNo}`);
    el.dataset.date = ydm;
    el.innerHTML = num;
    const cll = el.classList;
    cll.forEach(key => {
      if(key === cl) return;
      cll.remove(key);
      cll.add(cl);
    });
  }

  obj.dayNo += 1;
  obj.dayCount += ret;
  return {year, month, day: num, dayNo};
}

function setHoliday(obj) {
  const {dayNo} = obj;
  const element = document.getElementById(`mcdd-${dayNo}`);
  if(!element){
    obj.tHandle = setTimeout(setJapanHoliday, 1000, obj);
    return;
  }

  // 初期化
  element.title = "";
  Object.assign(element.style, {
    backgroundColor: "",
    position: "",
  });
  const hdayTmp = element.getElementsByClassName("hday");
  while(hdayTmp.length){
    hdayTmp.item(0).remove();
  }
  
  const date = element.dataset.date.split("-");// 非同期設定のため、dataプロパティから日付取得
  const year = date[0];
  const month = date[1];
  const day = date[2];
  const hString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const hDay = config[year].json[hString];
  const hDays = [];
  // 日本の休日設定
  if(hDay){
    element.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
    element.title = hDay;
  }
  // 固定イベント日設定
  if(config.ccHday[hString]){
    const item = config.ccHday[hString];
    hDays.push('ccHday', "ccHType"+ item.type );
    const ccDay = item.title;
    if(element.title.length) element.title += ("/" + ccDay);
    else element.title = ccDay;
  }
  // 追加イベント日設定
  if(config.nesHday[hString]){
    const item = config.nesHday[hString];
    hDays.push('nesHday', "nesHType"+ item.type );
    const nDay = item.title;
    if(element.title.length) element.title += ("/" + nDay);
    else element.title = nDay;
  }
  hDays.forEach(cl => {
    const hdayDiv = document.createElement('div');
    if(!hdayDiv.classList.contains('hday')){
      hdayDiv.classList.add('hday');
    }
    hdayDiv.classList.add(cl);
    element.appendChild(hdayDiv);
  });
}

function setJapanHoliday(inObj) {
  if(inObj.tHandle) {
    clearTimeout(inObj.tHandle);
  }
  const { year, dayNo } = inObj;

  // 休日一覧を取得中ならリトライ、あれば休日設定
  if(config[year] && config[year].json){
    setHoliday(inObj);
    return;
  } else if( config[year] ){
    // ネットワーク不調対策
    if(config[year].retray && config[year].retray[dayNo]){
      config[year].retray[dayNo] += 1;
    } else if( config[year].retray ){
      config[year].retray[dayNo] =  1;
    } else {
      config[year].retray = {
        [dayNo]: 1,
      }
    }
    if(config[year].retray[dayNo] > 3) {
      config[year].retray[dayNo] = 0;
      return;
    }

    inObj.tHandle = setTimeout(setJapanHoliday, 1000, inObj);
    return;
  }
  config[year] = {json: null};

  // Web から休日一覧を取得
  // バケットストレージに保存する
  const req = `https://holidays-jp.github.io/api/v1/date.json?year=${year}`;
  try {
    window.fetch(req)
      .then((response)=> response.json())
      .then((json) => {
        config[year].json = json;
        setHoliday(inObj);
      });
  } catch(err){
    // ネットワーク不調対策
    return;
  }
}

function createCalendar(year, month, now, obj) {
  const startDate = new Date(year, month - 1, 1); // 月の最初の日を取得
  const endDate = new Date(year, month,  0);  // 月の最後の日を取得
  const lastMonthEndDate = new Date(year, month - 1, 0);   // 前月の最後の日の情報

  Object.assign(obj, {
    startDay: startDate.getDay(), // 月の最初の日の曜日を取得
    endDayCount: endDate.getDate(), // 月の末日
    lastMonthendDayCount: lastMonthEndDate.getDate(), // 前月の末日
    dayCount: 1,
    calendarHtml: '',// HTMLを組み立てる変数
  });
  const yStr = `${year}年 ${month}月(令和${year - 2018}年)`;
  const hel = document.getElementById(`mcy:${obj.yearNo}`);
  if(hel){
    hel.textContent = yStr;
    obj.calendarHtml = null;
  } else {
    obj.calendarHtml += `<h2 id="mcy:${obj.yearNo}">${yStr}</h2>`;
    obj.calendarHtml += '<table>';

    // 曜日の行を作成
    for (let i = 0; i < weeks.length; i++) {
      obj.calendarHtml += '<td class="week-day">' + weeks[i] + '</td>';
    }
  }

  for (let w = 0; w < 6; w++) {
    setWeek(month, obj.dayCount, now, obj);
    for (let d = 0; d < 7; d++) {
      const newObj = setDay(obj, w, d);
      setJapanHoliday(newObj);
    }
    if (obj.calendarHtml) obj.calendarHtml += '</tr>';
  }

  if (obj.calendarHtml) obj.calendarHtml += '</table>'
  return obj.calendarHtml
}

function ShowCalendar(now) {
  // 日付が変わってなければ更新しない
  const nowDay = getNowDay(now);
  if(config.lastUpdate.d === nowDay[2]){
    return;
  }

  let year = nowDay[0];
  let month = nowDay[1];
  Object.assign(config.lastUpdate, {
    m: month,
    d: nowDay[2],
  });

  const obj = { yearNo: 1, weekNo: 1, dayNo: 1, now };
  for ( let i = 0; i < config.show; i++) {
    Object.assign(obj, {year, month});
    const calendarHtml = createCalendar(year, month, now, obj);
    if(calendarHtml){
      const sec = document.createElement('section');
      sec.innerHTML = calendarHtml;
      document.querySelector('#calendar').appendChild(sec);
    }

    month++
    if (month > 12) {
      year++
      month = 1
    }
    obj.yearNo += 1;
  }
}

/*********************************************************************************
 * 予定関連
 *********************************************************************************/
function getTimePercent(inHour, minute) {
  const hour = Number( inHour ) % 12;
  const totalMinutes = hour * 60 + Number(minute);  // 経過分
  const percent = (totalMinutes / (12 * 60));  // 12時間=720分
  return Number(percent.toFixed(5));  // 小数4桁に丸める
}
function createSector2(param = {}) {
  const {
    area_num = 1,
    donuts = 85,
    oAfx = 50,
    oAfh = 95 - donuts,
    oAfy = oAfx - oAfh,
    area = [
      {rate: 0.35, color:"crimson"},
      {rate: 0.45, color:"yellowgreen"},
      {rate: 0.20, color:"#999"},
    ],
  } = param;
  const value = document.getElementById("circle_graph_area");

  // グラフエリアに対しての処理。
  let masked = document.getElementById(`masked${area_num}`);
  let svg_area = document.getElementById(`svg1`);
  if(!svg_area){
    // 縦横比をスタイリング
    value.style.aspectRatio = "1/1";

    // svg_area の生成
    svg_area = document.createElementNS(SVG_NS, "svg");
    svg_area.setAttribute("id", `svg1`);
    svg_area.setAttribute("viewBox", "0 0 100 100");
    value.appendChild(svg_area);
  }
  let initArea = true;
  if(!masked){
    // mask されるグループを生成
    masked = document.createElementNS(SVG_NS, "g");
    // id を付与。あとでこの id を取得して mask する。
    masked.setAttribute("id", `masked${area_num}`);
    svg_area.appendChild(masked);
  } else {
    initArea = false;
  }

  // 扇作成。中心の座標と初期角度0を設定。
  let prex = oAfx;
  let prey = oAfh;
  let sumdegree = 0;

  // 扇形を作成
  area.forEach(({rate, color}, idx)=>{
    // 入力された%値から角度を算出。
    let degree = 360 * rate;
    // 自動配色。
    let wari = 360 / area.length;
    let tasi = 360 - wari;
    let def_hue = (wari + tasi * idx) % 360;
    // 具体的な色指定がなければ自動配色を適用。
    if(!color) {
      let L = 50; // 100:白, 0:黒
      const times = {};
      getNowDay(undefined, times);
      if((times.hour > 12 && area_num == 1) || (times.hour < 12 && area_num == 2)){
        L = 20;
      }
      color = `hsl(${def_hue},50%,${L}%)`;
    }
    // degreeが180以上か否かで、第４引数の値を分岐。
    let dai4;
    if(degree <= 180) {
      dai4 = 0;
    } else {
      dai4 = 1;
    }
    // 要素の合計が100%を越えたら、警告。
    // if((degree + sumdegree) > 360) {
    //   alert(`${area_num + 1}つ目のグラフ、内容の合計が100%を越えています。`)
    // }
    // 扇形外周部のxy座標
    let afx = Math.sin((degree + sumdegree) * Math.PI / 180) * oAfy + oAfx;
    let afy = oAfx - Math.cos((degree + sumdegree) * Math.PI / 180) * oAfy;
    afx = Math.trunc(afx * 1000) / 1000;
    afy = Math.trunc(afy * 1000) / 1000;

    // 塗りとパスデータ
    const oug1 = document.getElementById(`${area_num}path${idx}`);
    if(oug1){
      oug1.setAttribute("d",`M${oAfx},${oAfx} L${prex},${prey} A${oAfy},${oAfy} 0 ${dai4} 1 ${afx},${afy}Z`);
    } else {
      const oug = document.createElementNS(SVG_NS, "path");
      oug.setAttribute("id", `${area_num}path${idx}`);
      oug.setAttribute("fill", color);
      oug.setAttribute("d",`M${oAfx},${oAfx} L${prex},${prey} A${oAfy},${oAfy} 0 ${dai4} 1 ${afx},${afy}Z`);
      masked.appendChild(oug);
    }

    // 角度の累積を更新
    sumdegree += degree;
    // 扇形の円周部の座標を更新
    prex = afx;
    prey = afy;    
  });
  if(!initArea) return;

  // ドーナツ用の mask を作成
  let graph_mask = document.createElementNS(SVG_NS, "mask");
  graph_mask.setAttribute("id", `mask${area_num}`)
  // 内部の白長方形
  let sirorect = document.createElementNS(SVG_NS, "rect");
  sirorect.setAttribute("width","100%");
  sirorect.setAttribute("height","100%");
  sirorect.setAttribute("fill","#fff");
  graph_mask.appendChild(sirorect);

  // くり抜く黒丸
  let kuromaru = document.createElementNS(SVG_NS, "circle");
  
  // donuts の指定は100未満にする。
  if(donuts >= 100) {
    alert(`${area_num + 1}つ目のグラフ、ドーナツの指定は100未満で行ってください。`)
  }
  
  kuromaru.setAttribute("cx", "50");
  kuromaru.setAttribute("cy", "50");
  kuromaru.setAttribute("r", `${donuts * 0.4}`);
  graph_mask.appendChild(kuromaru);

  svg_area.appendChild(graph_mask);

  // マスクをかける
  document.getElementById(`masked${area_num}`).style.mask = `url(#mask${area_num})`
}

function makeTime(value){
  const tim = value.split(":");
  const h = tim[0];
  const m = tim[1];
  return getTimePercent(h, m);
}

let puts = false;
function CheckTimer(obj = {}) {
  if(obj.tHandle) {
    clearTimeout(obj.tHandle);
  }

  if(!obj.redraw){
    const targetEl = obj.target || this;
    if(!targetEl) return;

    // const inputEl = document.getElementById("appointmentIn");
    const val = targetEl.getAttribute("id");
    const row = targetEl.dataset.row;
    const timeObj = {s: null, e: null};
    const dbKey = `appoi${row}`;
    if(val === `appoiS${row}`){
      timeObj.s = targetEl.value;
      timeObj.e = document.getElementById(`appoiE${row}`).value;
    } else {
      timeObj.s = document.getElementById(`appoiS${row}`).value;
      timeObj.e = targetEl.value;
    }
    if( timeObj.s === '' || timeObj.e === ''){
      return;
    }
    putDB({
      data:{ id: dbKey , dataKey: dbKey, ...timeObj },
    });

    config.timerParam[dbKey] = {
      pm: timeObj.s > "12:00",
      nowP: makeTime(timeObj.s),
      nowT: makeTime(timeObj.e)
    };
  }

  const mekeOOG = (oogP) => {
    let donuts = 79;
    if(oogP === 2) donuts = 84;
    const param = {
      area_num: oogP,
      donuts, // 内枠
      area: [
        // {rate: nowP, color: "#000"},// 開始まで黒
        // {rate: nowT, color: null}, // 終了まで色
        // {rate: (1 - nowP - nowT), color:"#000"},
      ],
    }
    const arr = [];
    Object.keys(config.timerParam).forEach((el) => {
      if((oogP === 1) && config.timerParam[el].pm) return;
      if((oogP === 2) && !config.timerParam[el].pm) return;
      arr.push(config.timerParam[el].nowP,
               config.timerParam[el].nowT)
    });
    let sT = 0;
    let eT = 0;
    arr.sort().forEach((rate, idx) => {
      if ((idx % 2) === 0){
        param.area.push({rate: rate - eT, color: "black"});
        sT = rate;
      } else {
        if(rate - sT > 0){
          param.area.push({rate: rate - sT, color: null});
        } else {
          param.area[ param.area.length - 1 ].color = null;
        }
        eT = rate;
      }
    });
    param.area.push({rate: 1 - eT, color: "black"});

    createSector2(param);
  }
  mekeOOG(1);
  mekeOOG(2);
  if(obj.cb) obj.cb(obj);
}

/*********************************************************************************
 * 時計関連
 *********************************************************************************/
// 文字盤作成
function DrawClockFace() {
  const clockFace = document.querySelector(".clockFace");
  if(!clockFace) return;

  // 目盛り作成
  for(let n = 0; n <= 59; n++) {
    if ( n % 5 === 0) {
      // 時刻の目盛り作成
      const mark_hour = document.createElement('div');
      mark_hour.className = 'mark_hour';
      mark_hour.textContent = '';
      mark_hour.style.cssText = '--j:' + n + ';'; //cssの変数定義
      // 親要素の末尾に追加する
      clockFace.appendChild(mark_hour);
    } else {
      // 分の目盛り作成
      const mark_minute = document.createElement('div');
      mark_minute.className = 'mark_minute';
      mark_minute.textContent = '';
      mark_minute.style.cssText = '--j:' + n + ';'; //cssの変数定義
      // 親要素の末尾に追加する
      clockFace.appendChild(mark_minute);
    }
  }

  // 数字作成
  for(let m = 1; m <= 12; m++) {
    // 数字設置領域作成
    const number_area = document.createElement('div');
    number_area.className = 'number_area';
    number_area.style.cssText = '--i:' + m + ';'; //cssの変数定義
    // 親要素の末尾に追加する
    clockFace.appendChild(number_area);

    // 数字設置
    const number = document.createElement('div');
    number.className = 'number';
    number.textContent = m;
    number.style.cssText = '--i:' + m + ';'; //cssの変数定義
    // 数字設置領域に数字を置
    number_area.appendChild(number);
  }
}

// 長針・短針・その他情報表示
function UpdateClockAll(now) {
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();
  const day = now.getDay();

  // その他情報表示
  const dateArea = document.querySelector(".dateArea");
  if(!dateArea) return;
  let countH = (Math.floor(minutes / 15) * 0.25 );
  const wHours = config.workStart.hours;
  const wMinutes = config.workStart.minutes;
  if( hours < wHours ) {
    countH += ( 24 - wHours ) + hours;
  } else {
    countH += hours - wHours;
  }
  countH -= wMinutes;
  if( hours >= 12 ) countH -= 1;
  dateArea.textContent = `第${config.nowWeekNum + 1}週目 ${weeks[day]}曜日 ${countH}h`;

  // 時計の長針、短針の表示更新
  const minuteHand = document.querySelector('#minute');
  const minuteDegree = ((minutes / 60) * 360) + ((seconds/60)*6) + 90;
  minuteHand.style.transform = `rotate(${minuteDegree}deg)`;
  const hourHand = document.querySelector('#hour');
  const hourDegree = ((hours / 12) * 360) + ((minutes/60)*30) + 90;
  hourHand.style.transform = `rotate(${hourDegree}deg)`;
}

/**
 * 秒針
 *  ・1秒で6 度動く
 *  ・200msec 毎に位置を指定
 *  ・1秒で 1.2 度の角度変化
 *  ・角度の最小単位は 0.1 度
 */
function UpdateClock(obj) {
  if(obj?.ti) clearTimeout(obj.ti);
  // 日時取得
  let now = null;
  if(config.lastSeconds === -2){
    now = new Date("2025-04-30T17:32:30");
    config.lastSeconds = -1;
  } else {
    now = new Date();
  }
  const nowDay = getNowDay(now);
  const secondHand = document.querySelector('#second');

  // 計算量を減らして調整済みの秒針の角度
  const totalSeconds = (nowDay[4] / 1000) % 60;
  const msAngle = totalSeconds * 6 + 90;

  // 逆回転防止のため、角度がへる場合は一旦アニメーションなしで
  // 0.1度傾かせ、次からアニメションの再開を行う
  if(msAngle < 91.2){
    secondHand.style.transitionDuration = "0.0s";
    secondHand.style.transform = `rotate(${msAngle - 1.1}deg)`;
    const obj = {};
    obj.ti = setTimeout(UpdateClock, 0, obj);// アニメションするため、一回まつ
    return;
  }
  secondHand.style.transitionDuration = "0.2s";
  secondHand.style.transform = `rotate(${msAngle}deg)`;

  // 1秒に1回更新
  if(config.lastSeconds !== nowDay[5]) {
    UpdateClockAll( now );
  }

  // 1分に更新
  if(0 === nowDay[5]) {
    ShowCalendar( now );
    CheckTimer();
  }

  config.lastSeconds = nowDay[5];
}

/*********************************************************************************
 * メニュー関連
 *********************************************************************************/
function InputAppoi(row, col, elm, val){
  if(val === "＋" & col === 2){
    const elId = `appoiAdd${row}`;
    elm.innerHTML = `<button id="${elId}" data-row="${row}" >＋</button>`;
    SetEv({id: elId, key:"click", func:AddAppoi });
    return;
  }
  if(col === 2){
    const elId = `appoiDel${row}`;
    elm.innerHTML = `<button id="${elId}" data-row="${row}" >✖</button>`;
    SetEv({id:elId, key:"click", func:DelAppoi });
    return;
  }

  let elId = null;
  let label = null;
  if(col === 0){
    elId = `appoiS${row}`;
    label = 'aria-labelledby="開始時間"';
  } else {
    elId = `appoiE${row}`;
    label = 'aria-labelledby="終了時間"';
  }
  let input = `data-row="${row}" type="time" min="08:30" max="22:00" required`;
  input += ` value="${val}"`;
  elm.innerHTML += `<input id="${elId}" ${label} ${input}></input>`;
  SetEv({id: elId, key:"input", func:CheckTimer });
}

function AddAppoi(inObj) {
  if(inObj.tHandle){
    clearTimeout(inObj.tHandle);

    const {row2} = inObj;
    InputAppoi( row2, 0, inObj.tr.childNodes[0], "");
    InputAppoi( row2, 1, inObj.tr.childNodes[1], "");
    InputAppoi( row2, 2, inObj.tr.childNodes[2], "＋");
    return;
  }

  const row = this.dataset.row;
  this.removeEventListener('click', AddAppoi);

  // button -> td -> tr
  const tr = this.parentElement.parentElement;
  InputAppoi( row, 2, tr.childNodes[2], "");

  inObj.tr = document.createElement('tr');
  inObj.tr.innerHTML += `<td></td><td></td><td></td>`;
  tr.parentElement.appendChild(inObj.tr);  
  inObj.row2 = row + 1;
  inObj.tHandle = setTimeout(AddAppoi, 20, inObj);
}

function DelAppoi(inObj) {
  const elId = this.getAttribute("id");
  const elrow = this.dataset.row;

  this.removeEventListener('click', DelAppoi);
  delDB({ data: `appoi${elrow}` });
  delete config.timerParam[elId];

  // input -> td -> tr
  const tr = this.parentElement.parentElement;
  tr.remove();
  CheckTimer({ redraw: true });
}

function RightContent(obj) {
  const right_content = document.querySelector('.right-content');
  const cll = right_content.classList;
  cll.toggle('open');

  // 日のタイマー設定領域の作成
  const appoi = document.getElementById("appoiDiv");
  const small = document.createElement('small');
  small.innerHTML = "タイマ";
  appoi.appendChild(small);  
  const successCB = (p) => {
    const data = [];
    p.result.sort((a, b)=> a.s - b.s).forEach(({id, s, e}, idx) => {
      if(!s || !e) return;
      if(!config.timerParam[id]){
        config.timerParam[id] = {
          pm: s > "12:00",
          nowP: makeTime(s),
          nowT: makeTime(e),
        };
      } else {
        config.timerParam[id].pm = s > "12:00";
        config.timerParam[id].nowP = makeTime(s);
        config.timerParam[id].nowT = makeTime(e);
      }
      data.push([ s, e, idx]);
    });
    data.push([ "", "", "＋"]);
    MakeTable({ body:appoi, data, cb:InputAppoi});
    CheckTimer({redraw: true});
  };
  if (cll.contains('open')) {
    getAllDB({data: null, successCB});
  } else {
    const elements = appoi.querySelectorAll('[id^="appoi"]');
    elements.forEach(el => {
      el.removeEventListener('input', CheckTimer);
      el.removeEventListener('click', AddAppoi);
      el.removeEventListener('click', DelAppoi);
    });
    appoi.innerHTML = '';
  }
}

if(config.iH === null){
  initDB();
  DrawClockFace();
  config.iH = setInterval(UpdateClock, 200);
  //setInterval(reloadClock, 3500);

  document.getElementById('demo').addEventListener('click', RightContent);
  RightContent();
  //document.getElementById('appointmentIn').addEventListener('input', CheckTimer);
  //createSector2();
  CheckTimer();
  ShowCalendar();

  window.addEventListener("orientationchange resize", isSmartPhone);
  isSmartPhone();
}
