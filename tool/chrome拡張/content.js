/**
 * 参考のURL
 *   https://qiita.com/MeowMauPaws/items/e2310de1f122ac6430b0
 *   https://www.youtube.com/watch?v=N4BxnNLwZ5Q&list=RDN4BxnNLwZ5Q&start_radio=1
 *
 * ゆうつべの広告スキップボタン部品
 * aria-label="スポンサー" があると宣伝中と判断しミュート、スキップ押下
 *
 * 富士通, ASUS, NETGEAR, Mikrotik, Starlink
 *
 */
const SKIPTAG1 = ".ytp-skip-ad";
const SKIPTAG2 = ".ytp-skip-ad-button";
const tmpStoped = "動画が一時停止されました。続きを視聴しますか？";

const MuteS = {
  get Sponsor(){
    return this.getSponsor();
  },
  get Mute(){
    return this.getMute();
  },
  get MuteButton(){
    return this.getMuteButton();
  },
}

function setMusicFunc(){
  MuteS.getSponsor = () =>{
    const sponsor = document.querySelector('.badge-style-type-ad-stark');
    if(!sponsor) return false;
    const flg = sponsor.hasAttribute("hidden");
    return !flg;
  };
  MuteS.getMuteButton = () => {
    const muteButton3 = document.getElementById("expand-volume");
    if (muteButton3) {
      return muteButton3.querySelector("button");
    }
    return null;
  };
  MuteS.getMute = () => {
    const volume1 = document.getElementById("expand-volume-slider");
    if (volume1){
      return volume1.ariaValueNow === "0";
    }
    return false;
  };
}

function setVideoFunc(){
  let muteButton1 = null;
  MuteS.getSponsor = () =>{
    const sponsor = MuteS.root.querySelector('[aria-label="スポンサー"]');
    if(!sponsor) return false;

    const sponsorHtm = sponsor.innerHTML === "スポンサー";
    const sponsorTxt = sponsor.innerText === "スポンサー";
    return sponsorHtm && sponsorTxt;
  };
  MuteS.getMuteButton = () => {
    muteButton1 = MuteS.root.querySelector(".ytp-mute-button.ytp-button");
    if (muteButton1) return muteButton1;

    const div = MuteS.root.querySelector(".ytp-mute-button");
    if (!div) return null;
    muteButton1 = div.querySelector("button");
    return muteButton1;
  };
  MuteS.getMute = () =>{
    if(!muteButton1) muteButton1 = MuteS.MuteButton;
    return muteButton1?.dataset?.tooltipTitle?.startsWith("ミュート解除")
  };
}

const returnPlayerId = () => {
  const hostName = location.hostname;
  const subDomain = hostName.split(".")[0];
  switch (subDomain) {
  case "music":
    setMusicFunc();
    return "player";
    break;
  case "www":
  default:
    setVideoFunc();
    return "ytd-player";
    break;
  }
};

const clickMuteButton = (action, idx, root) => {
  const muteButton = MuteS.MuteButton;
  if (MuteS.Mute) {
    if (action === 0) {
      muteButton?.click();
    }
  } else if (muteButton) {
    if (action === 1) {
      muteButton?.click();
    }
  }
};

const clickSkipButton = () => {
  // 方法1: 広告動画の再生時間を最後に飛ばす（YouTube の .click() 対策回避）
  const video = document.querySelector('.ad-showing video')
    || document.querySelector('.ad-interrupting video');
  if (video && video.duration && isFinite(video.duration)) {
    video.currentTime = video.duration;
  }

  // 方法2: 通常のスキップボタンクリック（旧形式向け）
  const selectors = [
    ".ytp-ad-skip-button-modern",
    ".ytp-skip-ad-button",
    ".ytp-skip-ad",
    '.ytp-ad-skip-button-container button',
    '[class*="ytp-ad-skip"]',
  ];

  for (const sel of selectors) {
    const btn = document.querySelector(sel);
    if (!btn) continue;
    if (btn.disabled || btn.getAttribute("aria-disabled") === "true") continue;

    btn.click();
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    btn.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    btn.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    return;
  }
};

const KEY1 = 'ymp_side_panel';
const KEY2 = 'sponsor_mute';
const VIDEO_ONLY_STYLE_ID = "ytp-video-only-style";
let videoOnlyViewApplied = false;
const PANEL_IDS = [
  "content",
  "nav-bar-background",
  "nav-bar-divider",
  "guide",
  "mini-guide-background",
  "side-panel",
  "mini-guide",
];

const applyVideoOnlyView = () => {
  if (videoOnlyViewApplied) return; // 毎秒の再注入を防止
  videoOnlyViewApplied = true;

  // 旧スタイルタグを除去
  ["video-only-style", "caption-only-style"].forEach((id) => {
    document.getElementById(id)?.remove();
  });

  let style = document.getElementById(VIDEO_ONLY_STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = VIDEO_ONLY_STYLE_ID;
    document.head.appendChild(style);
  }

  // ヘッダーとサイドバーのみ非表示（プレイヤー周辺は一切触らない）
  style.textContent = `
    ytd-masthead {
      display: none !important;
    }
    #secondary {
      display: none !important;
    }
    ytmusic-two-column-browse-results-renderer,
    .style-scope.ytmusic-two-column-browse-results-renderer,
    #side-panel.style-scope.ytmusic-player-page,
    ytmusic-nav-bar.style-scope.ytmusic-app,
    #nav-bar-background.style-scope.ytmusic-app-layout,
    #player-bar-background.style-scope.ytmusic-app-layout,
    ytmusic-player-bar.style-scope.ytmusic-app {
      display: none !important;
    }

    /* YouTube Music: サイドパネル非表示時にプレイヤーを全幅化 */
    ytmusic-player-page #main-panel {
      max-width: 100% !important;
      width: 100% !important;
    }
    ytmusic-player-page {
      --ytmusic-player-page-side-panel-width: 0px !important;
    }

    /* 映像領域を1.25倍に拡大（transform はレイアウトに影響しない） */
    #movie_player {
      transform: scale(1.20) !important;
      transform-origin: center center !important;
    }
  `;
};

const clearVideoOnlyView = () => {
  videoOnlyViewApplied = false;
  document.getElementById(VIDEO_ONLY_STYLE_ID)?.remove();
  ["video-only-style", "caption-only-style"].forEach((id) => {
    document.getElementById(id)?.remove();
  });
};

const musicPlayListToggle = async () => {
  const SidePanel = (result0) => {
    if (!result0[KEY1]) {
      applyVideoOnlyView();
      return;
    }

    clearVideoOnlyView();

    let param = ``;
    PANEL_IDS.forEach(key => {
      const el = document.getElementById(key);
      if (!el) {
        return;
      }
      el.setAttribute("style", param);
    });
    // ["ytmusic-nav-bar"].forEach(key => {
    //   const sh = document.getElementsByClassName(key);
    //   console.log(sh);
    // });
  }

  chrome.storage.local.get([KEY1]).then(SidePanel);
}

const playerId = returnPlayerId();
const intervalFunc = () => {
  musicPlayListToggle();
  clickSkipButton();
  
  const root = document.getElementById(playerId);
  MuteS.root = root;
  if (root === null) {
    return;
  }

  const sponsor = MuteS.Sponsor;
  if (!sponsor) {
    clickMuteButton(0, 1, root);
    return;
  }
  if (sponsor) {
    clickMuteButton(1, 2, root);
  } else {
    clickMuteButton(0, 3, root);
  }
};

const initInterval = setInterval(() => {
  try {
    intervalFunc();
  } catch (err) {
    console.error("tvc", err);
  }
}, 1000);
