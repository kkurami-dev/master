/**
 * 時計、カレンダーのスクリプト
 */
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
  lastSeconds: -1,
  iH: null,
}
const weeks = ['日', '月', '火', '水', '木', '金', '土'];

// 文字盤作成
function DrawClockFace() {
  const clockFace = document.querySelector(".clockFace");
  if(!clockFace) return;

  // 目盛り作成
  for(let n = 0; n <= 59; n++) {
    if ( n % 5 == 0) {
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
  // 今日の日付を取得できるnew Dateを格納
  if(!today) today = new Date();

  // 年・月・日・曜日を取得
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const day = today.getDay();
  const msec = today.getTime();
  today = null;

  return [year, month, date, day, msec];
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
    year, month,
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

  const dd = `data-date="${month}/${dayNo}" id="mcdd-${dayNo}"`;
  if(obj.calendarHtml){
    obj.calendarHtml += `<td class="${cl}" ${dd}>${num}</td>`;
  } else {
    const el = document.getElementById(`mcdd-${dayNo}`);
    // el.className = cl;
    //el.class = cl;
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

function ShowCalendar(now) {
  // 日付が変わってなければ更新しない
  const nowDay = getNowDay(now);
  if(config.lastUpdate.d === nowDay[2]){
    return;
  }

  let year = nowDay[0];
  let month = nowDay[1];
  const day = nowDay[2];
  const s = nowDay[4];
  Object.assign(config.lastUpdate, {
    m: month,
    d: day,
    s,
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

function isNowWeerk(month, day, now){
  const nowDay = getNowDay(now);
  if(month === nowDay[1] && day <= nowDay[2] && nowDay[2] <= (day + 6)){
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
  const {year, month, day, dayNo} = obj;
  const element = document.getElementById(`mcdd-${dayNo}`);
  if(!element){
    obj.tHandle = setTimeout(setJapanHoliday, 1000, obj);
    return;
  }

  const hString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  element.title = "";
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
    obj.calendarHtml += `<h1 id="mcy:${obj.yearNo}">${yStr}</h1>`;
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

  // 時計の針を回す
  const minuteHand = document.querySelector('#minute');
  const minuteDegree = ((minutes / 60) * 360) + ((seconds/60)*6) + 90;
  minuteHand.style.transform = `rotate(${minuteDegree}deg)`;
  const hourHand = document.querySelector('#hour');
  const hourDegree = ((hours / 12) * 360) + ((minutes/60)*30) + 90;
  hourHand.style.transform = `rotate(${hourDegree}deg)`;
}

function UpdateClock() {
  // 日時取得
  let now = new Date();

  // 計算量を減らして調整済みの秒針の角度
  const msAngle = ((now.getTime() % 60000) * 0.006) + 90;
  const secondHand = document.querySelector('#second');
  secondHand.style.transform = `rotate(${msAngle}deg)`;

  const seconds = now.getSeconds();
  if(config.lastSeconds === seconds) {
    now = null;
    return;
  }

  config.lastSeconds = seconds;
  // 全体は1秒に1回更新
  UpdateClockAll(now);
  // カレンダーの更新確認は1秒に1回
  ShowCalendar( now );

  now = null;
}

if(config.iH === null){
  DrawClockFace();
  config.iH = setInterval(UpdateClock, 60);
  //setInterval(reloadClock, 3500);
}
