//文字盤作成
function drawClockFace() {
  const clockFace = document.querySelector(".clockFace");
  if(!clockFace) return;

  //目盛り作成
  let mark_hour;
  let mark_minute;
  for(let n = 0; n <= 59; n++) {
    if ( n % 5 == 0) {
      //時刻の目盛り作成
      mark_hour = document.createElement('div');
      mark_hour.className = 'mark_hour';
      mark_hour.textContent = '';
      mark_hour.style.cssText = '--j:' + n + ';'; //cssの変数定義
      // 親要素の末尾に追加する
      clockFace.appendChild(mark_hour);
    } else {
      //分の目盛り作成
      mark_minute = document.createElement('div');
      mark_minute.className = 'mark_minute';
      mark_minute.textContent = '';
      mark_minute.style.cssText = '--j:' + n + ';'; //cssの変数定義
      // 親要素の末尾に追加する
      clockFace.appendChild(mark_minute);
    }
  }

  //数字作成
  let number;
  for(let m = 1; m <= 12; m++) {
    //数字設置領域作成
    number_area = document.createElement('div');
    number_area.className = 'number_area';
    number_area.style.cssText = '--i:' + m + ';'; //cssの変数定義
    // 親要素の末尾に追加する
    clockFace.appendChild(number_area);

    //数字設置
    number = document.createElement('div');
    number.className = 'number';
    number.textContent = m;
    number.style.cssText = '--i:' + m + ';'; //cssの変数定義
    //数字設置領域に数字を置
    number_area.appendChild(number);
  }
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

  // デジタル時計
  const digital_clock = document.querySelector(".digital_clock");
  const hours_digital = hours;
  const minutes_digital = minutes;
  const seconds_digital = seconds;
  digital_clock.textContent = ( '0' + hours_digital ).slice( -2 ) + ":" + ( '0' + minutes ).slice( -2 ) + ":" + ( '0' + seconds ).slice( -2 );

}

function reloadClock(){
  // JavaScript でページをリフレッシュする方法 – JS でページを再読み込みする方法
  // https://www.freecodecamp.org/japanese/news/javascript-refresh-page-how-to-reload-a-page-in-js/
  //location.reload();
  location.reload(true);
  //location.replace();
  // location.href = location.href;
}

const weeks = ['日', '月', '火', '水', '木', '金', '土'];
const date = new Date();
let year = date.getFullYear();
let month = date.getMonth() + 1;
const config = {
  show: 3,
}

function showCalendar(year, month) {
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

function createCalendar(year, month) {
  const startDate = new Date(year, month - 1, 1) // 月の最初の日を取得
  const endDate = new Date(year, month,  0) // 月の最後の日を取得
  const endDayCount = endDate.getDate() // 月の末日
  const lastMonthEndDate = new Date(year, month - 2, 0) // 前月の最後の日の情報
  const lastMonthendDayCount = lastMonthEndDate.getDate() // 前月の末日
  const startDay = startDate.getDay() // 月の最初の日の曜日を取得
  let dayCount = 1 // 日にちのカウント
  let calendarHtml = '' // HTMLを組み立てる変数

  calendarHtml += '<h1>' + year  + '/' + month + '</h1>'
  calendarHtml += '<table>'

  // 曜日の行を作成
  for (let i = 0; i < weeks.length; i++) {
    calendarHtml += '<td>' + weeks[i] + '</td>'
  }

  for (let w = 0; w < 6; w++) {
    calendarHtml += '<tr>'
    for (let d = 0; d < 7; d++) {
      if (w == 0 && d < startDay) {
        // 1行目で1日の曜日の前
        let num = lastMonthendDayCount - startDay + d + 1
        calendarHtml += '<td class="is-disabled">' + num + '</td>'
      } else if (dayCount > endDayCount) {
        // 末尾の日数を超えた
        let num = dayCount - endDayCount
        calendarHtml += '<td class="is-disabled">' + num + '</td>'
        dayCount++
      } else {
        calendarHtml += `<td class="calendar_td" data-date="${year}/${month}/${dayCount}">${dayCount}</td>`
        dayCount++
      }
    }
    calendarHtml += '</tr>'
  }
  calendarHtml += '</table>'
  return calendarHtml
}

// function moveCalendar(e) {
//   document.querySelector('#calendar').innerHTML = '';
//   if (e.target.id === 'prev') {
//     month--
//     if (month < 1) {
//       year--
//       month = 12
//     }
//   }
//   if (e.target.id === 'next') {
//     month++
//     if (month > 12) {
//       year++
//       month = 1
//     }
//   }
//   showCalendar(year, month)
// }

// document.querySelector('#prev').addEventListener('click', moveCalendar);
// document.querySelector('#next').addEventListener('click', moveCalendar);

// document.addEventListener("click", function(e) {
//   if(e.target.classList.contains("calendar_td")) {
//     alert('クリックした日付は' + e.target.dataset.date + 'です')
//   }
// })

drawClockFace();
setInterval(updateClock, 1000);
updateClock();
setInterval(reloadClock, 3500);
showCalendar(year, month);
