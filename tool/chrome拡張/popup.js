
const KEY1 = 'ymp_side_panel';
const KEY2 = 'sponsor_mute';
const KEY3 = 'ad_skip';

function YmpSidePanel(e){
  if ("set" in e) {
    const ck = document.getElementById(e.key);
    ck.checked = e.set;
  } else {
    const {checked, id} = e.target;
    chrome.storage.session.set({ [id]: checked }).then((result1) => {
    });
  }
}

[KEY1, KEY2, KEY3].forEach(key => chrome.storage.session.get([key]).then((result) => {
  let checkButton1 = document.getElementById(key);
  checkButton1.addEventListener('change', YmpSidePanel);
  YmpSidePanel({ set: result[key], key });
}));
