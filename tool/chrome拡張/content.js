/**
 * YouTube 広告ミュート & UI カスタマイズ Chrome 拡張 (Content Script)
 *
 * 機能:
 *   1. 広告（スポンサー）検出時に自動ミュート / 広告終了時にミュート解除
 *   2. サイドパネル非表示 & 動画領域拡大（Video Only View）
 *
 * 参考URL:
 *   https://qiita.com/MeowMauPaws/items/e2310de1f122ac6430b0
 *   https://www.youtube.com/watch?v=N4BxnNLwZ5Q&list=RDN4BxnNLwZ5Q&start_radio=1
 */

// ---------------------------------------------------------------------------
// 定数
// ---------------------------------------------------------------------------
const tmpStoped = "動画が一時停止されました。続きを視聴しますか？";

const KEY1 = "ymp_side_panel";
const KEY2 = "sponsor_mute";
const VIDEO_ONLY_STYLE_ID = "ytp-video-only-style";

const PANEL_IDS = [
  "content",
  "nav-bar-background",
  "nav-bar-divider",
  "guide",
  "mini-guide-background",
  "side-panel",
  "mini-guide",
];

// ---------------------------------------------------------------------------
// ミュート制御オブジェクト
// ---------------------------------------------------------------------------
/**
 * MuteS — スポンサー検出・ミュート状態・ミュートボタン取得を
 * サブドメイン(music / www)ごとに差し替え可能にするアクセサオブジェクト
 */
const MuteS = {
  get Sponsor() {
    return this.getSponsor();
  },
  get Mute() {
    return this.getMute();
  },
  get MuteButton() {
    return this.getMuteButton();
  },
};

// ---------------------------------------------------------------------------
// YouTube Music 用の関数セット
// ---------------------------------------------------------------------------
function setMusicFunc() {
  /** 広告バッジが表示されているか判定 */
  MuteS.getSponsor = () => {
    const sponsor = document.querySelector(".badge-style-type-ad-stark");
    if (!sponsor) return false;
    return !sponsor.hasAttribute("hidden");
  };

  /** ミュートボタン要素を取得 */
  MuteS.getMuteButton = () => {
    const muteButton = document.getElementById("expand-volume");
    if (muteButton) {
      return muteButton.querySelector("button");
    }
    return null;
  };

  /** 現在ミュート中か判定 */
  MuteS.getMute = () => {
    const volume = document.getElementById("expand-volume-slider");
    if (volume) {
      return volume.ariaValueNow === "0";
    }
    return false;
  };
}

// ---------------------------------------------------------------------------
// YouTube (通常動画) 用の関数セット
// ---------------------------------------------------------------------------
function setVideoFunc() {
  let muteButton1 = null;

  /** aria-label="スポンサー" でスポンサー表示中か判定 */
  MuteS.getSponsor = () => {
    const sponsor = MuteS.root.querySelector('[aria-label="スポンサー"]');
    if (!sponsor) return false;
    return sponsor.innerHTML === "スポンサー" && sponsor.innerText === "スポンサー";
  };

  /** ミュートボタン要素を取得 */
  MuteS.getMuteButton = () => {
    muteButton1 = MuteS.root.querySelector(".ytp-mute-button.ytp-button");
    if (muteButton1) return muteButton1;

    const div = MuteS.root.querySelector(".ytp-mute-button");
    if (!div) return null;
    muteButton1 = div.querySelector("button");
    return muteButton1;
  };

  /** tooltip からミュート状態を判定 */
  MuteS.getMute = () => {
    if (!muteButton1) muteButton1 = MuteS.MuteButton;
    return muteButton1?.dataset?.tooltipTitle?.startsWith("ミュート解除");
  };
}

// ---------------------------------------------------------------------------
// サブドメイン判定 & 初期化
// ---------------------------------------------------------------------------
/**
 * ホスト名からサブドメインを判定し、適切な関数セットを設定して
 * プレイヤー要素のIDを返す
 */
const returnPlayerId = () => {
  const hostName = location.hostname;
  const subDomain = hostName.split(".")[0];

  switch (subDomain) {
    case "music":
      setMusicFunc();
      return "player";
    case "www":
    default:
      setVideoFunc();
      return "ytd-player";
  }
};

// ---------------------------------------------------------------------------
// 広告スキップ（シーク）
// ---------------------------------------------------------------------------
/**
 * 広告再生中の動画を検出し、再生位置を末尾に飛ばして広告を終了させる
 * ※ YouTube側に広告ブロッカーとして検出される可能性あり
 */
const skipAdBySeek = () => {
  const video =
    document.querySelector(".ad-showing video") ||
    document.querySelector(".ad-interrupting video");
  if (video && video.duration && isFinite(video.duration)) {
    video.currentTime = video.duration;
  }
};

// ---------------------------------------------------------------------------
// 「動画が一時停止されました」ダイアログの自動応答
// ---------------------------------------------------------------------------
/**
 * YouTube が長時間再生時に表示する「動画が一時停止されました。続きを視聴しますか？」
 * ダイアログを検出し、「はい」ボタンをクリックして再生を継続する
 */
const dismissPauseDialog = () => {
  // ダイアログ内の「はい」ボタンを探す
  const buttons = document.querySelectorAll(
    "yt-confirm-dialog-renderer button, ytd-popup-container button, tp-yt-paper-dialog button"
  );

  for (const btn of buttons) {
    const text = btn.textContent?.trim();
    if (text === "はい" || text === "Yes") {
      btn.click();
      return true;
    }
  }

  // YouTube Music の場合
  const paperButtons = document.querySelectorAll("tp-yt-paper-button, yt-button-renderer button");
  for (const btn of paperButtons) {
    const text = btn.textContent?.trim();
    if (text === "はい" || text === "Yes") {
      btn.click();
      return true;
    }
  }

  return false;
};

// ---------------------------------------------------------------------------
// 広告ブロッカー検出時の回避（次の動画へ遷移）
// ---------------------------------------------------------------------------
let blockerDetected = false;

/**
 * YouTubeが広告ブロッカー警告ダイアログを表示した場合、
 * 1秒待ってからプレイリストの次の動画に移動する
 */
const skipToNextIfBlocked = () => {
  // 広告ブロッカー警告ダイアログの検出
  const dialog =
    document.querySelector("tp-yt-paper-dialog.ytd-enforcement-message-view-model") ||
    document.querySelector("ytd-enforcement-message-view-model") ||
    document.querySelector("#dialog.ytd-popup-container tp-yt-paper-dialog");

  if (!dialog) {
    blockerDetected = false;
    return false;
  }

  // ダイアログが非表示なら無視
  if (dialog.hidden || dialog.style.display === "none") {
    blockerDetected = false;
    return false;
  }

  // 既に検出済みなら重複実行しない（タイマー待機中）
  if (blockerDetected) return true;
  blockerDetected = true;

  // 1秒待ってから次の動画へ遷移
  setTimeout(() => {
    // 次の動画ボタンをクリック（YouTube通常）
    const nextButton =
      document.querySelector(".ytp-next-button") ||
      document.querySelector("a.ytp-next-button");

    if (nextButton) {
      nextButton.click();
      return;
    }

    // YouTube Music の場合
    const nextButtonMusic =
      document.querySelector(".next-button button") ||
      document.querySelector("tp-yt-paper-icon-button.next-button");

    if (nextButtonMusic) {
      nextButtonMusic.click();
    }
  }, 1000);

  return true;
};

// ---------------------------------------------------------------------------
// ミュートボタン操作
// ---------------------------------------------------------------------------
/**
 * action に応じてミュートボタンをクリック
 * @param {number} action - 0: ミュート解除, 1: ミュート実行
 */
const clickMuteButton = (action) => {
  const muteButton = MuteS.MuteButton;

  if (MuteS.Mute) {
    // 現在ミュート中 → 解除要求(action===0)のときクリック
    if (action === 0) {
      muteButton?.click();
    }
  } else if (muteButton) {
    // 現在ミュートでない → ミュート要求(action===1)のときクリック
    if (action === 1) {
      muteButton?.click();
    }
  }
};

// ---------------------------------------------------------------------------
// Video Only View（UI簡略化）
// ---------------------------------------------------------------------------
let videoOnlyViewApplied = false;

/**
 * ヘッダー・サイドバーを非表示にし、動画領域を拡大するスタイルを注入
 */
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

  style.textContent = `
    /* YouTube: ヘッダーとサイドバーを非表示 */
    ytd-masthead {
      display: none !important;
    }
    #secondary {
      display: none !important;
    }

    /* YouTube Music: ナビ・サイドパネル・プレイヤーバーを非表示 */
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

    /* 映像領域を1.20倍に拡大（transform はレイアウトに影響しない） */
    #movie_player {
      transform: scale(1.20) !important;
      transform-origin: center center !important;
    }
  `;
};

/**
 * Video Only View を解除し、元のレイアウトに戻す
 */
const clearVideoOnlyView = () => {
  videoOnlyViewApplied = false;
  document.getElementById(VIDEO_ONLY_STYLE_ID)?.remove();
  ["video-only-style", "caption-only-style"].forEach((id) => {
    document.getElementById(id)?.remove();
  });
};

// ---------------------------------------------------------------------------
// サイドパネル表示切替
// ---------------------------------------------------------------------------
/**
 * chrome.storage の設定値に応じて Video Only View の適用/解除を切り替える
 */
const musicPlayListToggle = async () => {
  // 拡張コンテキストが無効なら何もしない
  if (!chrome.runtime?.id) return;

  const handleSidePanel = (result) => {
    if (!result[KEY1]) {
      applyVideoOnlyView();
      return;
    }

    clearVideoOnlyView();

    // パネル要素のスタイルをリセット
    PANEL_IDS.forEach((key) => {
      const el = document.getElementById(key);
      if (!el) return;
      el.setAttribute("style", "");
    });
  };

  try {
    const result = await chrome.storage.session.get([KEY1]);
    handleSidePanel(result);
  } catch (e) {
    // Extension context invalidated — 無視して停止
  }
};

// ---------------------------------------------------------------------------
// メインループ
// ---------------------------------------------------------------------------
const playerId = returnPlayerId();

/**
 * 1秒ごとに実行されるメイン処理
 * - UI切替の適用
 * - スポンサー検出 → ミュート制御
 */
const intervalFunc = () => {
  musicPlayListToggle().catch(() => {});

  const root = document.getElementById(playerId);
  MuteS.root = root;
  if (!root) return;

  // 「動画が一時停止されました」ダイアログを自動で閉じる
  dismissPauseDialog();

  // 広告ブロッカー警告が出ていたら次の動画へスキップ
  if (skipToNextIfBlocked()) return;

  const sponsor = MuteS.Sponsor;
  if (sponsor) {
    // スポンサー表示中 → ミュート & シークで広告スキップ
    clickMuteButton(1);
    skipAdBySeek();
  } else {
    // スポンサーなし → ミュート解除
    clickMuteButton(0);
  }
};

/** 1秒間隔でメインループを実行（拡張コンテキスト無効時は自動停止） */
const initInterval = setInterval(() => {
  try {
    // 拡張がリロード/更新されると chrome.runtime.id が undefined になる
    if (!chrome.runtime?.id) {
      clearInterval(initInterval);
      return;
    }
    intervalFunc();
  } catch (err) {
    if (err.message?.includes("Extension context invalidated")) {
      clearInterval(initInterval);
      return;
    }
    console.error("tvc", err);
  }
}, 1000);
