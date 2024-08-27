import { Selector } from 'testcafe';
import { ID, PW } from './.config.ts';

// リファレンス
//   https://testcafe.io/documentation/402666/reference/test-api/selector
// 日本語使い方
//   https://qiita.com/natsu_mikan/items/b9b5a2f504af1ee1c4f1
//   https://qiita.com/natsu_mikan/items/c02ad4761670f7e61856
// サンプル
//   https://qiita.com/YamaAri/items/5bcdcae294278862db90

// サイトの指定
fixture('HOTEL LOCAL').page(`http://${ID}:${PW}@192.168.20.3/wifi/multi.html`); // ベーシック認証でページにアクセス

// テストケース1
test('有効/無効のトグル', async (t) => {
  // 要素の取得
  const onoff = await Selector('#m_validWifi_2g');
  const v1 = await onoff.value;
  if(v1 === "1") return;
  const offB = onoff.sibling();
  const 適用 = await Selector('input[type="submit"][value="適用"]');

  // テスト開始
  await t
    // それぞれの動作
    .click(offB)
    .click(適用);
});
