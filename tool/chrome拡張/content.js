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

// 動画か音楽かで探すIDを変更
const returnPlayerId = () => {
  const hostName = location.hostname;
  const subDomain = hostName.split(".")[0];
  switch (subDomain) {
    case "music":
      return "player";
      break;
    case "www":
    default:
      return "ytd-player";
      break;
  }
};

const isMusicSponsor = (root) => {
  const sponsor = document.querySelector('.badge-style-type-ad-stark');
  if(!sponsor) return false;
  const flg = sponsor.hasAttribute("hidden");
  return !flg;
}
const isVidoSponsor = (root) => {
  const sponsor = root.querySelector('[aria-label="スポンサー"]');
  if(!sponsor) return false;

  const sponsorHtm = sponsor.innerHTML === "スポンサー";
  const sponsorTxt = sponsor.innerText === "スポンサー";
  return sponsorHtm && sponsorTxt;
}
const isSponsor = (root) => {
  if (returnPlayerId() === "player") {
    return isMusicSponsor(root);
  }
  return isVidoSponsor(root);
}

const getMuteButton = (root) => {
  // Youtube Music
  const muteButton3 = document.getElementById("expand-volume");
  if (muteButton3) {
    const muteButton4 = muteButton3.querySelector("button");
    return muteButton4;
  }
  
  const muteButton1 = root.querySelector(".ytp-mute-button.ytp-button");
  if (muteButton1) return muteButton1;

  const div = root.querySelector(".ytp-mute-button");
  if (!div) return null;
  const muteButton2 = div.querySelector("button");
  return muteButton2;
};

const isMute = (root) => {
  const volume1 = document.getElementById("expand-volume-slider");
  if (volume1){
    return volume1.ariaValueNow === "0";
  }

  const volume2 = root?.dataset?.tooltipTitle?.startsWith("ミュート解除")
  return volume2 !== null;
}

const clickMuteButton = (action, idx, root) => {
  const muteButton = getMuteButton(root);
  if (isMute()) {
    if (action === 0) {
      muteButton?.click();
    }
  } else if (muteButton) {
    if (action === 1) {
      muteButton?.click();
    }
  }
};

const playerId = returnPlayerId();
const intervalFunc = () => {
  const root = document.getElementById(playerId);
  if (root === null) {
    return;
  }

  const sponsor = isSponsor(root);
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
