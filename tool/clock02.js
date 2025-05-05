/**
 * 時計、カレンダーのスクリプト
 *
 * 参考URL
 *    時計： https://techlife.asahi.com/n/n6e0eb40e78d5
 *    カレンダー： https://qiita.com/kan_dai/items/b1850750b883f83b9bee
 *    円グラフ：https://fuuno.net/ani/ani89/circle_graph.html
 */
const DB_VERSION = 2;
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
}
const weeks = ['日', '月', '火', '水', '木', '金', '土'];

function initDB( param = {} ){
  if(param.db) return;
  
  const {
    dbName = 'sampleDB1',
    dbStore = 'sampleStore1',
    func,
  } = param;

  // DB名を指定して接続。DBがなければ新規作成される。
  let openReq  = indexedDB.open(dbName, DB_VERSION );
  openReq.onupgradeneeded = function reqUpGrade(event){
    // onupgradeneededは、DBのバージョン更新(DBの新規作成も含む)時のみ実行
    console.log('db upgrade');
    const db = event.target.result;

    // オブジェクトストア作成
    const store = db.createObjectStore(dbStore, {keyPath : 'id', autoIncrement: true});
    store.createIndex('dataKey', 'dataKey', { unique: true });
    store.createIndex('title', 'title', { unique: false });
    store.createIndex('type', 'type', { unique: false });
  }
  openReq.onsuccess = function actMng(event){
    // onupgradeneededの後に実行。更新がない場合はこれだけ実行
    console.log('db open success');
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
  const typeMap = {
    1:{ f: "readwrite", e: "add" },
    2:{ f: "readwrite", e: "put" },
    3:{ f: "readonly", e: "get" },
  };
  const tF = typeMap[ param.type ];
  if(!param.db){
    param.func = initDB;
    mngDB(param);
    return;
  }

  const {data, db, storeName, successCB, compCB } = param;
  const trans = db.transaction(storeName, tF.f );
  const putReq = trans.objectStore(storeName).store[ tF.e ](data);
  putReq.onsuccess = function(){
    if(successCB) successCB( param );
  }
  trans.oncomplete = function(){
    if(compCB) compCB( param );
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
function getNowDay(today) {
  // 年・月・日・曜日を取得
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const day = today.getDay();
  const sec = today.getSeconds();
  const msec = today.getTime();
  today = null;

  /*      0     1      2     3    4     5 */
  return [year, month, date, day, msec, sec];
}

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

////////////////////////////////////////
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

function setHoliday(obj) {
  const {dayNo} = obj;
  const element = document.getElementById(`mcdd-${dayNo}`);
  if(!element){
    obj.tHandle = setTimeout(setJapanHoliday, 1000, obj);
    return;
  }
  const date = element.dataset.date.split("-");// 非同期設定のため、dataプロパティから日付取得
  const year = date[0];
  const month = date[1];
  const day = date[2];

  const hString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  element.title = "";
  Object.assign(element.style, {
    backgroundColor: "",
    position: "",
  });
  const hDay = config[year].json[hString];
  if(hDay){
    element.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
    element.title = hDay;
  }
  if(config.ccHday[hString]){
    const ccDay = config.ccHday[hString].title;
    element.style.position = "relative";
    // element.classList.add = "cc-holiday";
    if(element.title.length) element.title += ("/" + ccDay);
    else element.title = ccDay;
  }
  if(config.nesHday[hString]){
    const nDay = config.nesHday[hString].title;
    element.style.position = "relative";
    // element.classList.add = "n-holiday";
    if(element.title.length) element.title += ("/" + nDay);
    else element.title = nDay;
  }
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
  const yStr = `${year}年 ${month}月(令和${year - 2019}年)`;
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

// 日時の更新
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
 * 予定関連
 */
function getTimePercent(inHour, minute) {
  const hour = Number( inHour ) % 12;
  const totalMinutes = hour * 60 + Number(minute);  // 経過分
  const percent = (totalMinutes / (12 * 60)) * 100;  // 12時間=720分
  return Number(percent.toFixed(2));  // 小数2桁に丸める
}
function createSector2(param = {}) {
  const {
    donuts = 80,
    area = [
      {rate: 35, color:"crimson"},
      {rate: 45, color:"yellowgreen"},
      {rate: 20, color:"#999"},
    ],
  } = param;
  const graph_areas = document.querySelectorAll(".circle_graph_area");

  // 各グラフエリアに対しての処理。
  graph_areas.forEach(function(value, area_num) {
    let masked = document.getElementById(`masked${area_num}`);
    let svg_area = document.getElementById(`svg${area_num}`);
    let initArea = true;
    if(!masked){
      // 縦横比をスタイリング
      value.style.aspectRatio = "1/1";

      // svg_area の生成
      svg_area = document.createElementNS(SVG_NS, "svg");
      svg_area.setAttribute("id", `svg${area_num}`);
      svg_area.setAttribute("viewBox", "0 0 100 100");
      value.appendChild(svg_area);

      // mask されるグループを生成
      masked = document.createElementNS(SVG_NS, "g");
      // id を付与。あとでこの id を取得して mask する。
      masked.setAttribute("id", `masked${area_num}`);
      svg_area.appendChild(masked);
    } else {
      initArea = false;
    }

    // 扇作成。中心の座標と初期角度0を設定。
    let prex = 50;
    let prey = 10;
    let sumdegree = 0;

    // 扇形を作成
    area.forEach(({rate, color}, idx)=>{
      // 入力された%値から角度を算出。
      let degree = 360 * rate / 100;
      // 自動配色。
      let wari = 360 / area.length;
      let tasi = 360 - wari;
      let def_hue = (wari + tasi * idx) % 360;
      // 具体的な色指定がなければ自動配色を適用。
      if(!color) {
        color = `hsl(${def_hue},50%,69%)`;
      }
      // degreeが180以上か否かで、第４引数の値を分岐。
      let dai4;
      if(degree <= 180) {
        dai4 = 0;
      } else {
        dai4 = 1;
      }
      // 要素の合計が100%を越えたら、警告。
      if((degree + sumdegree) > 360) {
        alert(`${area_num + 1}つ目のグラフ、内容の合計が100%を越えています。`)
      }
      // 扇形外周部のxy座標
      let afx = Math.sin((degree + sumdegree) * Math.PI / 180) * 40 + 50;
      let afy = 50 - Math.cos((degree + sumdegree) * Math.PI / 180) * 40;
      afx = Math.trunc(afx * 1000) / 1000;
      afy = Math.trunc(afy * 1000) / 1000;

      // 塗りとパスデータ
      if(initArea){
        const oug = document.createElementNS(SVG_NS, "path");
        oug.setAttribute("id", `${area_num}path${idx}`);
        oug.setAttribute("fill", color);
        oug.setAttribute("d",`M50,50 L${prex},${prey} A40,40 0 ${dai4} 1 ${afx},${afy}Z`);
        masked.appendChild(oug);
      } else {
        const oug1 = document.getElementById(`${area_num}path${idx}`);
        oug1.setAttribute("d",`M50,50 L${prex},${prey} A40,40 0 ${dai4} 1 ${afx},${afy}Z`);
      }

      // 角度の累積を更新
      sumdegree += degree;
      // 扇形の円周部の座標を更新
      prex = afx;
      prey = afy;    
    });
    if(!initArea) return;

    // ドーナツ属性があれば, ドーナツ用の mask を作成
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
  });
}

function CheckTimer(now) {
  const inputEl = document.getElementById("appointmentIn");
  const tim = inputEl.value.split(":");
  if(tim[0] === '') return;

  const hour = now.getHours() % 12;
  const minute = now.getMinutes();
  const nowP = getTimePercent(hour, minute);
  const h = tim[0];
  const m = tim[1];
  const nowT = getTimePercent(h, m) - nowP;

  const param = {
    donuts: 80,
    area: [
      {rate: nowP, color: "#000"},
      {rate: nowT, color: "yellowgreen"},
      {rate: (100 - nowP - nowT), color:"#000"},
    ],
  }

  createSector2(param);
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

  // 全体は1秒に1回更新
  if(config.lastSeconds === nowDay[5]) {
    return;
  }
  config.lastSeconds = nowDay[5];
  UpdateClockAll( now );
  CheckTimer(now);
  // カレンダーの更新確認は1秒に1回
  ShowCalendar( now );
}

function RightContent(obj) {
  const right_content = document.querySelector('.right-content');
  const cll = right_content.classList;
  cll.toggle('open');
}

if(config.iH === null){
  initDB();
  DrawClockFace();
  config.iH = setInterval(UpdateClock, 200);
  //setInterval(reloadClock, 3500);

  document.getElementById('demo').addEventListener('click', RightContent);
  //createSector2();
}
