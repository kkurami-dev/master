
# 設定

2020/12/04 作成時点

# Google Play Console に サービスアカウント を利用
ここでは、Google Play Console にサービスアカウントをセットアップし、ア
プリ内アイテムの価格を取得するまでの参考情報を記載する。
アプリ内アイテムの参照には AWS Lambda で node.js の 
[googleapis/google-api-nodejs-client](https://github.com/googleapis/google-api-nodejs-client) 
を利用し参照を行う。

- アプリの公開、アプリ側の設定は情報が多々あるので、ここでは説明しない。  
  - [Google Play Storeにアプリを公開する](https://qiita.com/minuro/items/536ac3f7c27c1442a1cb)
  - [androidでアプリ内課金をする](http://tech-gym.com/2011/07/android/396.html)
- OAuth 2.0 に付いても情報があるので、ここでは説明しない。  
  - [サーバー間のアプリケーションで OAuth 2.0 を使う](https://prev.net-newbie.com/apps/OAuth2ServiceAccount.html)
  - 

## リンクの設定前

下記文言が表示される

> このプロジェクトに関連付けられた OAuth クライアントはありません  
> このプロジェクトに関連付けられたサービス アカウントはありません  

![APIアクセス前](https://github.com/kkurami-dev/master/blob/in-app-purchase/TrivialDriveKotlin/202012_purchases/API%20アクセス-リンク前.jpg "API アクセス-リンク前")

1. サービスアカウントの作成  
  他Webサイトで、多々情報がある為そちらを参考に  
  ![OAuth クライアント関連付け後](https://github.com/kkurami-dev/master/blob/in-app-purchase/TrivialDriveKotlin/202012_purchases/API%20アクセス-リンク_OAuthクライアント関連付け後.jpg "OAuthクライアント関連付け後")

1. 「新しいサービスアカウントを作成」を選択、Google Cloud Platform に
   アクセス  
   ![新しいサービスアカウント作成](https://github.com/kkurami-dev/master/blob/in-app-purchase/TrivialDriveKotlin/202012_purchases/API%20アクセス-リンク_新しいサービスアカウント作成.jpg "新しいサービスアカウント作成")

## サービスアカウント作成

1. ロールの設定
  追加で設定
  - Google Play Billing API
  - [クライアント ライブラリとサービス アカウントを使用してレポートをダウンロードする](https://support.google.com/googleplay/android-developer/answer/6135870?visit_id=637428342562683103-3129570089&p=stats_export&rd=1#export)
  - [Google サービス アカウントのセットアップ](https://docs.vmware.com/jp/VMware-Workspace-ONE-UEM/1907/Android_Platform/GUID-AWT-CREATE-GOOGLESERVACCOUNT.html)


## リンクの設定

1. サービスアカウント関連付け後（反映までに時間がかかるかも）
  1. 関連付け結果  
    サービスアカウントにGooglePlayDeveloperPublishing API の許可が付い
    ていると、サービスアカウントに表示される。
    ![関連付け後](https://github.com/kkurami-dev/master/blob/in-app-purchase/TrivialDriveKotlin/202012_purchases/API%20アクセス-リンク後.jpg "関連付け後")
  1. アプリを追加  
    この時点ではまだ、どのアプリにもアクセス出来ないので、参照対象のア
    プリを追加する。  
    ![アプリを追加](https://github.com/kkurami-dev/master/blob/in-app-purchase/TrivialDriveKotlin/202012_purchases/API%20アクセス-アプリを追加.jpg "アプリを追加")  
    追加し、変更を保存
  1. 権限を設定  
    追加した有りのどの情報にアクセス出来るようにするか、権限を設定する  
    ![ユーザを招待](https://github.com/kkurami-dev/master/blob/in-app-purchase/TrivialDriveKotlin/202012_purchases/API%20アクセス-リンク_ユーザを招待.jpg "ユーザを招待")
  1. ユーザと権限  
    ![ユーザと権限](https://github.com/kkurami-dev/master/blob/in-app-purchase/TrivialDriveKotlin/202012_purchases/API%20アクセス-リンク_ユーザと権限.jpg "ユーザと権限")

1. APIの動作確認
  1. ダッシュボード の 「APIとサービスの有効化」を選択  
    ![APIとサービスの有効化](https://github.com/kkurami-dev/master/blob/in-app-purchase/TrivialDriveKotlin/202012_purchases/API%20アクセス-リンク_APIとサービスの有効化.jpg "API アクセス-リンク_APIとサービスの有効化")  
  1. リストの中から「Google Play Android Developer API」を探し選択  
    ![APIライブラリ](https://github.com/kkurami-dev/master/blob/in-app-purchase/TrivialDriveKotlin/202012_purchases/API%20アクセス-リンク_APIライブラリ.jpg "APIライブラリ")
  1. API が有効なら、APIを試すを選択  
    ![Google_Play_Android_Developer_API](https://github.com/kkurami-dev/master/blob/in-app-purchase/TrivialDriveKotlin/202012_purchases/API%20アクセス-リンク_Google_Play_Android_Developer_API.jpg "Google_Play_Android_Developer_API")  
    エラーが出た場合はサービスアカウントの作成、サービスアカウントの設
    定を見直す。
    --- エラー例 ---
    - The project id used to call the Google Play Developer API has not been linked in the Google Play Developer Console.
      -> アプリの追加が行われていない
      -> 権限の設定が漏れている
      -> SCOP が間違っている
         - Google Play Console Developer
         - Google Play Billing API
         - androidpublisher
         
    - Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project.
      -> アクセストークンの期限切れ(作成して1時間たった、設定している有効期限が切れた)

https://console.developers.google.com/

# google-api-nodejs-client
- google-api-nodejs-client-master/src/apis/androidpublisher/v3.ts
- androidpublisher nodejs "price"

## 【参考】
  - [Android Publisherによるストア管理の自動化](https://techlife.cookpad.com/entry/2014/09/10/175601)
  - [Google APIs Node.js Client を使って Google Analytics のページビューを取得する](https://dev.classmethod.jp/articles/using-google-apis-node-js-client/)

## 【公式】
- [購入ステータスAPI](https://docs.huihoo.com/android/4.4/google/play/billing/gp-purchase-status-api.html)
- [Using OAuth 2.0 for Server to Server Applications](https://developers.google.com/identity/protocols/oauth2/service-account#httprest_1)
- [googleapis/google-api-nodejs-client](https://github.com/googleapis/google-api-nodejs-client#oauth2-client)
- [scope の一覧](https://developers.google.com/identity/protocols/oauth2/scopes)

# Trivial Drive Kotlin
https://github.com/android/play-billing-samples/tree/master/TrivialDriveKotlin

## Google Play Console
- 収益化のセットアップ / ライセンス
  

Google_Play_Android_Developer_API
