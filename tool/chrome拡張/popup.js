
const KEY1 = 'ymp_side_panel';
const KEY2 = 'sponsor_mute';

function YmpSidePanel(e){
  if ("set" in e) {
    const ck = document.getElementById(e.key);
    ck.checked = e.set;
  } else {
    const {checked, id} = e.target;
    //console.log("2 Value is set", id, checked );
    chrome.storage.local.set({ [id]: checked }).then((result1) => {
      //console.log("3 Value is set", checked, result1 );
    });
  }
}

[KEY1, KEY2].forEach(key => chrome.storage.local.get([key]).then((result) => {
  let checkButton1 = document.getElementById(key);
  checkButton1.addEventListener('change', YmpSidePanel);
  YmpSidePanel({ set: result[key], key });
}));
;
