/**
 * 参考のURL
 *   https://qiita.com/MeowMauPaws/items/e2310de1f122ac6430b0
 *   https://www.youtube.com/watch?v=N4BxnNLwZ5Q&list=RDN4BxnNLwZ5Q&start_radio=1
 *

 ゆうつべの広告スキップボタン部品
 aria-label="スポンサー" があると宣伝中
 */
const hostName = location.hostname;
const subDomain = hostName.split('.')[0];
const SKIPTAG = "ytp-skip-ad-button";

const tmpStoped = '動画が一時停止されました。続きを視聴しますか？';

// 動画か音楽かで探すIDを変更
const returnPlayerId = (v) => {
  switch (v) {
  case 'music':
    return 'player';
    break;
  case 'www':
  default:
    return 'ytd-player';
    break;
  }
};

const clickSkipButton = (root) => {
  const sponsor = document.querySelector('[aria-label="スポンサー"]');
  const skip = root.getElementsByClassName(SKIPTAG);
  if(skip === null || sponsor === null){
    clickMuteButton(0, 1);
    return;
  }
  //console.log('tvc sk', skip, 'sp', sponsor);
  if (skip[0] || sponsor[0]) {
    clickMuteButton(1, 2);
  } else {
    clickMuteButton(0, 3);
  }
};

const clickMuteButton = (action, idx) => {
  const muteButton = document.querySelector(".ytp-mute-button.ytp-button");
  //console.log('tvc mute', action, muteButton.dataset.tooltipTitle);
  if(muteButton?.dataset?.tooltipTitle?.startsWith('ミュート解除')){
    if(action === 0){
      const res = muteButton.click();
      console.log('tvc mute off click',  res, idx );
    }
  } else if(muteButton){
    if(action === 1){
      const res = muteButton.click();
      console.log('tvc mute on click',  res, idx );
    }
  }
};

const isMute = () => {
  const muteButton = document.querySelector(".ytp-mute-button.ytp-button");
  if (muteButton) {
    const titleText = muteButton.getAttribute('title');
    const ariaLabel = muteButton.getAttribute('aria-label');
    // マウスホバーの状態によってtitleText/ariaLabelどちらが存在するか変わる。存在する方を使う
    const labelText = titleText || ariaLabel;
    if (labelText) {
      return labelText.includes('解除');
    } else {
      console.error('Both title and aria-label attributes are not present');
    }
  } else {
    console.error('muteButton element is not found');
  }
  return false;
};

const obConfig = {
  childList: true,
  subtree: true
};
const observer = new MutationObserver((mutations) => {
  //console.log('tvc m1', mutations);
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length && mutation.addedNodes[0].className === 'ytp-ad-player-overlay') {
      console.log('add player-overlay');
      if (isMute()) {
        return;
      }

      clickMuteButton(1, 4);
    };
    // 特定のノード(広告)が削除された場合の処理
    if (mutation.removedNodes.length && mutation.removedNodes[0].className === 'ytp-ad-player-overlay') {
      console.log('remove player-overlay');
      if (!isMute()) {
        return;
      }

      clickMuteButton(0, 5);
    }
  });
});

const playerId = returnPlayerId(subDomain);
const intervalFunc = () => {
  if (document.getElementById(playerId) != null) {
    const obTarget = document.getElementById(playerId);
    observer.observe(obTarget, obConfig);
    clickSkipButton(obTarget);
    //clearInterval(initInterval);
  }
}

const initInterval = setInterval(() => {
  try {
    intervalFunc();
  } catch(err){
    console.error('tvc', err);
  }
}, 1000);
