const {google} = require('googleapis');
const key = require('./gsuite_admin_service_account.json');
const scopes = ['https://www.googleapis.com/auth/androidpublisher'];
const subadress = 'kkurami.dev@gmail.com';// [組織に所属する誰かのメールアドレス]

async function PurchaseVlidate(){
  //return await requestProductValidation("com.isaidamier.kotlin.cc_kk_trivialdrive");
  // ・公式のAPI仕様書
  //    https://developers.google.com/android-publisher/api-ref/rest/
  //    https://googleapis.dev/nodejs/googleapis/44.0.0/androidpublisher/classes/Androidpublisher-3.html
  // ・ライブラリのソースの場所
  //    node_modules/googleapis/build/src/apis/androidpublisher
  // ・Indexing API を使用する前提条件
  //    https://developers.google.com/search/apis/indexing-api/v3/prereqs?hl=ja#node.js

  // 認証情報の作成
  // .readonly 付ける？
  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/androidpublisher'],
    null
  );

  // REST APIのセットアップ
  const androidApi = google.androidpublisher({
    version: 'v3',
    auth: jwtClient
  })

  // 認証しアクセストークン取得
  let authorize = await jwtClient.authorize();
  //console.log("authorize %j", authorize);

  // レシート情報
  let receipt = {
    packageName: "com.isaidamier.kotlin.cc_kk_trivialdrive",
    productId: "",
    purchaseToken: ""
  };

  // アプリ内アイテム一覧取得
  const result1 = await androidApi.inappproducts.list({
    packageName: receipt.packageName,
  });
  console.log("inappproducts.list %j", result1);

  // レシートの検証
  const result2 = await androidApi.purchases.products.get({
    packageName: receipt.packageName,
    productId: receipt.productId,
    token: receipt.purchaseToken
  });
  console.log("purchases.products.get %j", result2);
}

exports.handler = async (event) => {
  await PurchaseVlidate();
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
