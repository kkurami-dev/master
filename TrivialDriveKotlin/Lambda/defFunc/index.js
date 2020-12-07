const {google} = require('googleapis');
const key = require('./gsuite_admin_service_account.json');
const scopes = ['https://www.googleapis.com/auth/androidpublisher'];
const subadress = 'kkurami.dev@gmail.com';// [組織に所属する誰かのメールアドレス]

// サービスアカウント情報(`gsuite_admin_service_account.json`)の読み込み
//const jwtClient = new google.auth.JWT(
const getAuthorizedClient = () => {
  let auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes,
    subadress,
  });
  //console.log("auth.JWT", auth);
  return auth;
};

// サービスアカウント情報を利用したクライアント認証
//jwtClient.authorize();
const getAndroidpublisher = () => {
  let publisher = google.androidpublisher({
    version: 'v3',
    auth: getAuthorizedClient()
  });
  console.log("androidpublisher", publisher);
  return publisher;
}

const requestProductValidation = data => new Promise((resolve, reject) => {
  let ret;
  let api = getAndroidpublisher();
  ret = api.inappproducts( data );
  console.log("inappproducts", ret);
  ret = api.purchases.products.get(data, (err, response) => {
    console.log("purchases get", err, response);
    if (err) {
      console.error(`The API returned an error: ${err}`);
      resolve({status: "Error"});
    } else {
      const isValid = response && response.data && response.data.purchaseState === 0;
      resolve({status: isValid ? "OK" : "Error"});
    }
  });
  //console.log("purchases.products.get", ret);
});

async function PurchaseVlidate(){
  //return await requestProductValidation("com.isaidamier.kotlin.cc_kk_trivialdrive");
  // ・公式のAPI仕様書
  //    https://developers.google.com/android-publisher/api-ref/rest/
  //    https://googleapis.dev/nodejs/googleapis/44.0.0/androidpublisher/classes/Androidpublisher-3.html
  // ・ライブラリのソースの場所
  //    node_modules/googleapis/build/src/apis/androidpublisher
  // ・Indexing API を使用する前提条件
  //    https://developers.google.com/search/apis/indexing-api/v3/prereqs?hl=ja#node.js

  // .readonly 付ける？
  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/androidpublisher'],
    null
  );

  const androidApi = google.androidpublisher({
    version: 'v3',
    auth: jwtClient
  })

  // 認証しアクセストークン取得
  let authorize = await jwtClient.authorize();
  console.log("authorize %j", authorize);

  let receipt = {
    packageName: "com.isaidamier.kotlin.cc_kk_trivialdrive",
  };

  const result1 = await androidApi.inappproducts.list({
    packageName: receipt.packageName,
  });
  console.log("purchases.Products.get %j", result1);

  const result2 = await androidApi.purchases.Products.get({
    packageName: receipt.packageName,
    productId: receipt.productId,
    token: receipt.purchaseToken
  });
  console.log("purchases.Products.get %j", result2);
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
