/**
 * 参考のURL
 *   https://qiita.com/MeowMauPaws/items/e2310de1f122ac6430b0
 *   https://www.youtube.com/watch?v=N4BxnNLwZ5Q&list=RDN4BxnNLwZ5Q&start_radio=1
 *

 ゆうつべの広告スキップボタン部品
 <button class="ytp-skip-ad-button" id="skip-button:v" style="opacity: 0.5;"><div class="ytp-skip-ad-button__text">スキップ</div><span class="ytp-skip-ad-button__icon"><svg height="100%" viewBox="-6 -6 36 36" width="100%"><path d="M5,18l10-6L5,6V18L5,18z M19,6h-2v12h2V6z" fill="#fff"></path></svg></span></button>

 <button class="ytp-mute-button ytp-button" aria-keyshortcuts="m" title="" data-tooltip-offset-y="0" data-tooltip-title="ミュート解除（m）" aria-label="ミュート解除（m）" data-title-no-tooltip="ミュート解除"><div class="ytp-volume-icon"><svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><use class="ytp-svg-shadow" xlink:href="#ytp-id-51"></use><path class="ytp-svg-fill" d="m 21.48,17.98 c 0,-1.77 -1.02,-3.29 -2.5,-4.03 v 2.21 l 2.45,2.45 c .03,-0.2 .05,-0.41 .05,-0.63 z m 2.5,0 c 0,.94 -0.2,1.82 -0.54,2.64 l 1.51,1.51 c .66,-1.24 1.03,-2.65 1.03,-4.15 0,-4.28 -2.99,-7.86 -7,-8.76 v 2.05 c 2.89,.86 5,3.54 5,6.71 z M 9.25,8.98 l -1.27,1.26 4.72,4.73 H 7.98 v 6 H 11.98 l 5,5 v -6.73 l 4.25,4.25 c -0.67,.52 -1.42,.93 -2.25,1.18 v 2.06 c 1.38,-0.31 2.63,-0.95 3.69,-1.81 l 2.04,2.05 1.27,-1.27 -9,-9 -7.72,-7.72 z m 7.72,.99 -2.09,2.08 2.09,2.09 V 9.98 z" id="ytp-id-51"></path></svg></div></button>

 <div class="ad-simple-attributed-string ytp-ad-badge__text--clean-player" id="ad-simple-attributed-string:1bq" aria-label="スポンサー" style="">スポンサー</div>

 <div class="ytp-ad-player-overlay-layout__player-card-container"><div class="ytp-ad-avatar-lockup-card ytp-ad-component--clickable" id="ad-avatar-lockup-card:1bk" style=""><img class="ytp-ad-avatar ytp-ad-avatar--size-m ytp-ad-avatar--circular" id="ad-avatar:1bl" src="https://yt3.ggpht.com/proxy/hHBeWDwZqbFnna7CHY6X4XSIsLBni-U8hL51XbWqhBVzIVPfB_wIsEKd4nyO0r2wtWN2dOOplV9BEzcqeQXc2oWhdkY8yAKoqXYTz-xxgYJ2ZnZOmMcsin3Bu7aSM49tVBDcN3lzEYKereap5HjUN6X_VVvf56Anif7ph3eklMZmW005JWewwCtzhDzNXiBtOJyay0AxxRpkmF-M5CSUVcvHE60TI-3edNWyv5ccQHDdCpXDUEzcFLlm_85TKcpksm3v=w1920-h1920-nd" style=""><div class="ytp-ad-avatar-lockup-card__avatar_and_text_container"><div class="ytp-ad-avatar-lockup-card__text_container"><div class="ad-simple-attributed-string ytp-ad-avatar-lockup-card__headline" id="ad-simple-attributed-string:1bm" aria-label="Google カレンダー" style="">Google カレンダー</div><div class="ad-simple-attributed-string ytp-ad-avatar-lockup-card__description" id="ad-simple-attributed-string:1bn" aria-label="workspace.google.com" style="">workspace.google.com</div></div></div><button class="ytp-ad-button-vm ytp-ad-component--clickable ytp-ad-button-vm--style-filled ytp-ad-button-vm--size-default" id="ad-button:1bo" aria-label="登録 This link opens in new tab" role="link" style=""><span class="ytp-ad-button-vm__text">登録</span></button></div></div>

 強制一時停止の解除ボタン
 <button class="yt-spec-button-shape-next yt-spec-button-shape-next--text yt-spec-button-shape-next--call-to-action yt-spec-button-shape-next--size-m yt-spec-button-shape-next--enable-backdrop-filter-experiment" title="" aria-label="はい" aria-disabled="false"><div class="yt-spec-button-shape-next__button-text-content"><span class="yt-core-attributed-string yt-core-attributed-string--white-space-no-wrap" role="text">はい</span></div><yt-touch-feedback-shape style="border-radius: inherit;"><div aria-hidden="true" class="yt-spec-touch-feedback-shape yt-spec-touch-feedback-shape--touch-response"><div class="yt-spec-touch-feedback-shape__stroke"></div><div class="yt-spec-touch-feedback-shape__fill"></div></div></yt-touch-feedback-shape></button>

 <button class="yt-spec-button-shape-next yt-spec-button-shape-next--text yt-spec-button-shape-next--call-to-action yt-spec-button-shape-next--size-m yt-spec-button-shape-next--enable-backdrop-filter-experiment" title="" aria-label="はい" aria-disabled="false"><div class="yt-spec-button-shape-next__button-text-content"><span class="yt-core-attributed-string yt-core-attributed-string--white-space-no-wrap" role="text">はい</span></div><yt-touch-feedback-shape style="border-radius: inherit;"><div aria-hidden="true" class="yt-spec-touch-feedback-shape yt-spec-touch-feedback-shape--touch-response"><div class="yt-spec-touch-feedback-shape__stroke"></div><div class="yt-spec-touch-feedback-shape__fill"></div></div></yt-touch-feedback-shape></button>
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
  const skip = root.getElementsByClassName(SKIPTAG);
  if(skip === null){
    clickMuteButton(0);
    return;
  }
  if (skip[0]) {
    //console.log('tvc sk', skip[0]);
    clickMuteButton(1);
  } else {
    clickMuteButton(0);
  }
};

const clickMuteButton = (action) => {
  const muteButton = document.querySelector(".ytp-mute-button.ytp-button");
  if (!muteButton) return;

  console.log('tvc mute', muteButton.dataset.tooltipTitle);
  if(muteButton.dataset.tooltipTitle.startsWith('ミュート解除')){
    if(action === 0){
      muteButton.click();
    }
  } else {
    if(action === 1){
      muteButton.click();
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
      if (!isMute()) {
        clickMuteButton(1);
      }
    };
    // 特定のノード(広告)が削除された場合の処理
    if (mutation.removedNodes.length && mutation.removedNodes[0].className === 'ytp-ad-player-overlay') {
      if (isMute()) {
        clickMuteButton(0);
      }
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
    console.error('intervalFunc', err);
  }
}, 1000);
