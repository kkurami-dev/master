const weeks = ['日', '月', '火', '水', '木', '金', '土'];
const date = new Date();
let year = date.getFullYear();
let month = date.getMonth() + 1;
const config = {
  show: 3,
  ccHday:{
    "2025-04-28": "有休消化日",
    "2025-04-30": "有休奨励日(アニバーサリー休暇)",
    "2025-05-01": "有休奨励日(アニバーサリー休暇)",
    "2025-05-02": "有休奨励日(アニバーサリー休暇)",
    "2025-08-12": "夏季休日、年末年始休",
    "2025-08-13": "夏季休日、年末年始休",
    "2025-08-14": "夏季休日、年末年始休",
    "2025-08-15": "有休消化日",
    "2025-09-11": "有休奨励日(アニバーサリー休暇)",
    "2025-12-22": "有休消化日",
  },
  nHday:{
  },
  lastUpdate: null,
}

// 文字盤作成
function drawClockFace() {
  const clockFace = document.querySelector(".clockFace");
  if(!clockFace) return;

  //目盛り作成
  for(let n = 0; n <= 59; n++) {
    if ( n % 5 == 0) {
      //時刻の目盛り作成
      const mark_hour = document.createElement('div');
      mark_hour.className = 'mark_hour';
      mark_hour.textContent = '';
      mark_hour.style.cssText = '--j:' + n + ';'; //cssの変数定義
      // 親要素の末尾に追加する
      clockFace.appendChild(mark_hour);
    } else {
      //分の目盛り作成
      const mark_minute = document.createElement('div');
      mark_minute.className = 'mark_minute';
      mark_minute.textContent = '';
      mark_minute.style.cssText = '--j:' + n + ';'; //cssの変数定義
      // 親要素の末尾に追加する
      clockFace.appendChild(mark_minute);
    }
  }

  //数字作成
  for(let m = 1; m <= 12; m++) {
    //数字設置領域作成
    const number_area = document.createElement('div');
    number_area.className = 'number_area';
    number_area.style.cssText = '--i:' + m + ';'; //cssの変数定義
    // 親要素の末尾に追加する
    clockFace.appendChild(number_area);

    //数字設置
    const number = document.createElement('div');
    number.className = 'number';
    number.textContent = m;
    number.style.cssText = '--i:' + m + ';'; //cssの変数定義
    //数字設置領域に数字を置
    number_area.appendChild(number);
  }
}

function reloadClock(){
  // JavaScript でページをリフレッシュする方法 – JS でページを再読み込みする方法
  // https://www.freecodecamp.org/japanese/news/javascript-refresh-page-how-to-reload-a-page-in-js/
  //location.reload();
  location.reload(true);
  //location.replace();
  // location.href = location.href;
}

function getNowDay() {
  // 今日の日付を取得できるnew Dateを格納
  const today = new Date();

  // 年・月・日・曜日を取得
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const day = today.getDay();
  return [year, month, date, day];
}

function showCalendar(year, month) {
  // 日付が変わってなければ更新しない
  const nowDay = getNowDay()[2];
  if(config.lastUpdate === nowDay){
    return;
  }
  config.lastUpdate = nowDay;

  for ( let i = 0; i < config.show; i++) {
    const calendarHtml = createCalendar(year, month);
    const sec = document.createElement('section');
    sec.innerHTML = calendarHtml;
    document.querySelector('#calendar').appendChild(sec);

    month++
    if (month > 12) {
      year++
      month = 1
    }
  }
}

function isNowWeerk(month, day){
  const nowDay = getNowDay();
  if(month === nowDay[1] && day <= nowDay[2] && nowDay[2] <= (day + 7)){
    return true;
  }
  return false;
}

function isNowDay(month, day){
  const nowDay = getNowDay();
  if(month === nowDay[1] && day === nowDay[2]){
    return true;
  }
  return false;
}

function setJapnHoliday(year, month, day) {
  if(day > 31) return;
  const hString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // 休日設定実処理
  const setHoliday = () => {
    const qString = `td.calendar_td[data-date="${year}/${month}/${day}"]`;
    const element = document.querySelector(qString);
    if(!element){
      setTimeout(() => setJapnHoliday(year, month, day), 1000);
    }

    const hDay = config[year].json[hString];
    if(hDay){
      element.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
      element.title = hDay;
    }
    const ccDay = config.ccHday[hString];
    if(ccDay){
      element.style.position = "relative";
      element.classList.add = "cc-holiday";
      if(element.title) element.title += ccDay;
      else element.title = ccDay;
    }
    const nDay = config.nHday[hString];
    if(nDay){
      element.style.position = "relative";
      element.classList.add = "n-holiday";
      if(element.title) element.title += nDay;
      else element.title = nDay;
    }
  };

  // 休日一覧を取得中ならリトライ、あれば休日設定
  if(config[year] && config[year].json){
    setHoliday();
    return;
  } else if(config[year]){
    // ネットワーク不調対策
    if(config[year].retray[hString]) config[year].retray[hString] += 1;
    else config[year].retray = {
      [hString]: 1,
    }
    if(config[year].retray[hString] > 3) {
      config[year].retray[hString] = 0;
      return;
    }

    setTimeout(()=> setJapnHoliday(year, month, day), 1000);
    return;
  }
  config[year] = {};

  // Web から休日一覧を取得
  const req = `https://holidays-jp.github.io/api/v1/date.json?year=${year}`;
  try {
    window.fetch(req)
      .then((response)=> response.json())
      .then((json) => {
        config[year].json = json;
        setHoliday();
      });
  } catch(err){
    // ネットワーク不調対策
    return;
  }
}

function createCalendar(year, month) {
  const startDate = new Date(year, month - 1, 1) // 月の最初の日を取得
  const endDate = new Date(year, month,  0)  // 月の最後の日を取得
  const endDayCount = endDate.getDate() // 月の末日
  const lastMonthEndDate = new Date(year, month - 1, 0)   // 前月の最後の日の情報
  const lastMonthendDayCount = lastMonthEndDate.getDate() // 前月の末日
  const startDay = startDate.getDay() // 月の最初の日の曜日を取得
  let dayCount = 1 // 日にちのカウント
  let calendarHtml = '' // HTMLを組み立てる変数

  calendarHtml += '<h1>' + year  + '/' + month + '</h1>';
  calendarHtml += '<table>';

  // 曜日の行を作成
  for (let i = 0; i < weeks.length; i++) {
    calendarHtml += '<td>' + weeks[i] + '</td>';
  }

  for (let w = 0; w < 6; w++) {
    if(isNowWeerk(month, dayCount)){
      calendarHtml += '<tr class="now-week">';
    } else {
      calendarHtml += '<tr>';
    }
    for (let d = 0; d < 7; d++) {
      const dd = `data-date="${year}/${month}/${dayCount}"`;
      setJapnHoliday(year, month, dayCount);
      if (w == 0 && d < startDay) {
        // 1行目で1日の曜日の前
        let num = lastMonthendDayCount - startDay + d + 1;
        calendarHtml += `<td class="is-disabled" ${dd}>${num}</td>`;
        continue;
      } else if (dayCount > endDayCount) {
        // 末尾の日数を超えた
        let num = dayCount - endDayCount;
        calendarHtml += `<td class="is-disabled" ${dd}>${num}</td>`;
      } else if (isNowDay(month, dayCount)){
        calendarHtml += `<td class="now-day" ${dd}>${dayCount}</td>`;
      } else {
        calendarHtml += `<td class="calendar_td" ${dd}>${dayCount}</td>`;
      }
      dayCount++;
    }
    calendarHtml += '</tr>'
  }
  calendarHtml += '</table>'
  return calendarHtml
}

// 日時の更新
function updateClock() {
  const dayArr = ["日", "月", "火", "水", "木", "金", "土"];

  // 日時取得
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const day = now.getDay();

  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  // 日付表示
  const dateArea = document.querySelector(".dateArea");
  if(!dateArea) return;
  let dateText = `${year}年${("0" + month).slice(-2)}月${("0" + date).slice(-2)}日（${dayArr[day]}）`;
  dateArea.textContent = dateText;

  // 午前午後表示
  const branchAmPm = document.querySelector(".branchAmPm");
  if(hours >= 12) {
    branchAmPm.textContent = "午後";
  } else {
    branchAmPm.textContent = "午前";
  }

  const secondHand = document.querySelector('#second');
  const minuteHand = document.querySelector('#minute');
  const hourHand = document.querySelector('#hour');

  const secondDegree = ((seconds / 60) * 360) + 90;
  const minuteDegree = ((minutes / 60) * 360) + ((seconds/60)*6) + 90;
  const hourDegree = ((hours / 12) * 360) + ((minutes/60)*30) + 90;

  // 時計の針を回す
  secondHand.style.transform = `rotate(${secondDegree}deg)`;
  minuteHand.style.transform = `rotate(${minuteDegree}deg)`;
  hourHand.style.transform = `rotate(${hourDegree}deg)`;

  showCalendar(year, month);
}

drawClockFace();
setInterval(updateClock, 1000);
updateClock();
//setInterval(reloadClock, 3500);
showCalendar(year, month);
