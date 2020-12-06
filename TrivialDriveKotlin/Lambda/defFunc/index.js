const {google} = require('googleapis');
const key = require('./gsuite_admin_service_account.json');
const scopes = ['https://www.googleapis.com/auth/androidpublisher'];
const subadress = 'kkurami.dev@gmail.com';// [組織に所属する誰かのメールアドレス]

// サービスアカウント情報(`gsuite_admin_service_account.json`)の読み込み
//const jwtClient = new google.auth.JWT(
const getAuthorizedClient = () => new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes,
  subadress,
});

// サービスアカウント情報を利用したクライアント認証
//jwtClient.authorize();
const getAndroidpublisher = () => google.androidpublisher({
    version: 'v3',
    auth: getAuthorizedClient()
});

const requestProductValidation = data => new Promise((resolve, reject) => {
    getAndroidpublisher().purchases["products"].get(data, (err, response) => {
        if (err) {
            console.log(`The API returned an error: ${err}`);
            resolve({status: "Error"});
        } else {
            const isValid = response && response.data && response.data.purchaseState === 0;
            resolve({status: isValid ? "OK" : "Error"});
        }
    });
});

async function PurchaseVlidate(){
  return requestProductValidation("com.isaidamier.kotlin.cc_kk_trivialdrive");
}

exports.handler = async (event) => {
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
