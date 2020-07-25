-*- coding: utf-8-unix -*-

# React Native のもろもろ
## バージョン
  | soft | version |
  | --- | --- |
  | react-native | 0.61.4 |
  | expo-cli --version |  3.13.1 |
  
$ npm version
```
{ npm: '6.4.1',
  ares: '1.15.0',
  cldr: '33.1',
  http_parser: '2.8.0',
  icu: '62.1',
  modules: '64',
  napi: '3',
  nghttp2: '1.34.0',
  node: '10.14.2',
  openssl: '1.1.0j',
  tz: '2018e',
  unicode: '11.0',
  uv: '1.23.2',
  v8: '6.8.275.32-node.45',
  zlib: '1.2.11' }
```

## バージョン情報の自動挿入と表示
- コミットするたびに .env の VERSION が自動で書き換わる
  v0.1.0-1-g4c048192 -> v0.1.0-6-g7ce81a1c
- 事前に v?.?.? のタグが入っている必要が有る
  (git describe --tags で必要)
- 自動生成ファイルは git のリポジトリから作成する為、
  commit や push は不要(必ず衝突してしまう)

### git のコマンドでクローンしたディレクトリで１回だけ実行する
      $ git config --local core.hooksPath .githooks
      $ chmod -R +x .githooks/

### 【自動挿入される文字列の意味】
        v0.1.0 : バージョン情報として記載された git tag の番号
           -1- : タグを設定してからのコミット回数
     g4c048192 : g + ??? ( ??? の部分は git のコミットハッシュの先頭9文字 )


## 環境設定
```
expo start --tunnel

expo install react-navigation
expo install react-navigation-stack 
expo install react-navigation-tabs 
expo install react-native-gesture-handler 
expo install react-native-reanimated

expo install react-native-screens@2.2.0
expo install react-native-safe-area-context@0.7.3
expo install react-native-community/masked-view@0.1.6


npm i react-native-safe-area-context
npm i react-native-screens
npm i react-navigation-drawer
npm i react-native-vector-icons
npm i @egjs/hammerjs

npm i react-navigation-material-bottom-tabs
npm i react-native-paper

npm ls react-native
npm ls expo

npm i -g exp
npm i -g react-native-scripts

exp build:android
```


----------------------------------------

'expo'.

----------------------------------------
## 画面

01. App.js : 最初に読み込まれるファイル
01. Page1DetailScreen.js
01. Page1DetailScreen2.js



----------------------------------------
                    navigationOptions: {
                        ({ navigation }) => ({
                            headerLeft: (
                                    <Icon name="bars"
                                size={24}
                                onPress={() => navigation.toggleLeftDrawer()}
                                style={{ paddingLeft: 20 }}
                                    />
                            ),
                        }),
                    },
----------------------------------------

  "expo": {
   "name": "Your App Name",
   "icon": "./path/to/your/app-icon.png",
   "version": "1.0.0",
   "slug": "your-app-slug",
   "sdkVersion": "17.0.0",
   "ios": {
     "bundleIdentifier": "com.yourcompany.yourappname"
   },
   "android": {
     "package": "com.yourcompany.yourappname"
   }
  }

----------------------------------------
https://exp.host/@kuramitsu/expo_sample
https://expo.io/turtle-status
https://expo.io/builds/019411b9-092b-4f9e-8c4c-7422f764fca2

----------------------------------------

## ローカルPCで APK を作成する（できなかった）
[手順](https://www.robincussol.com/build-standalone-expo-apk-ipa-with-turtle-cli/)

1. (コンソール１)コンパイル  
        $ update-alternatives --config java
        $ npm start --unsafe-perm --verbose
    
1. (コンソール２)コンパイルの push
        $ expo export --dev --public-url http://127.0.0.1:8000
    
1. (コンソール３)ビルド提供WEBサーバ立ち上げ
        $ cd dist
        $ python ../http_server.py
    
1. (コンソール２) APK の作成
        $ sudo turtle setup:android --sdk-version 36.0.0
        $ keytool -genkeypair -v -keystore keystore.jks -alias keyalias -keyalg RSA -keysize 2048 -validity 9125
        $ EXPO_ANDROID_KEYSTORE_PASSWORD="keystorepassword" \
           EXPO_ANDROID_KEY_PASSWORD="keypassword" \
           turtle build:android \
             --type apk \
             --keystore-path ./should-be-private/keystore.jks \
             --keystore-alias "keyalias" \
             --public-url http://127.0.0.1:8000/dist/android-index.json
 
## エラーとその対応
---
Some of your project's dependencies are not compatible with currently installed expo package version
:
 - react-native-screens - expected version range: 2.0.0-alpha.12 - actual version installed: ^2.2.0
 - react-native-safe-area-context - expected version range: 0.6.0 - actual version installed: ^0.7.3
 - @react-native-community/masked-view - expected version range: 0.1.5 - actual version installed: ^
0.1.6
Your project may not work correctly until you install the correct versions of the packages.
To install the correct versions of these packages, please run: expo install [package-name ...]
Error: Problem validating fields in app.json. See https://docs.expo.io/versions/v36.0.0/workflow/configuration/
 • should NOT have additional property 'performance'.

---
Warning: Page1ScreenDetail: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). This component defines getSnapshotBeforeUpdate() only.


---
const LeftDrawer1 = createDrawerNavigator(
  {
    DrawerHome: Page1Screen,
    DrawerPageOne: Single1,
    DrawerPageTwo: Single2,
  },
  {
    initialRouteName: 'DrawerHome',
    //For the Custom sidebar menu we have to provide our CustomSidebarMenu
    contentComponent: CustomSidebarMenu,
    drawerWidth: 200,
  }
);
---
CustomSidebarMenu.js

----------------------------------------
## 画像に回転するようなアニメーションを行う
``` nodejs
// 必要となるモジュール
import {
  StyleSheet, Animated, View, Easing,
} from 'react-native';

export default class Page1Screen extends Component {
  // コンストラクタでアニメーション部品を作成
  constructor(props) {
    super(props);
    this.RotateValueHolder = new Animated.Value(0);
  }
  componentDidMount() {
    // 画面作成後から回転を始める
    this.StartImageRotateFunction();
  }
  // 画像回転のメイン関数
  StartImageRotateFunction() {
    this.RotateValueHolder.setValue(0);
    Animated.timing(this.RotateValueHolder, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
    }).start(() => this.StartImageRotateFunction());
  }
  render() {
    // 回転のパラメータ
    const RotateData = this.RotateValueHolder.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

   //回転する部品の表示
    return (
      <View style={styles.container}>
        <Animated.Image
          style={{
            width: 200,
            height: 200,
            transform: [{ rotate: RotateData }],
          }}
          source={{
            uri:
            'https://raw.githubusercontent.com/AboutReact/sampleresource/master/old_logo.png',
          }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C2C2C2',
  },
});
```

## ボタンを押して、文字列反映
```
import Child from './Child';

export default class Parent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: 'ボタンを押して',
    };
  }

  updateParentState(_text) {
    this.setState({text: _text})
  }

  render() {
    return (
      <View>
        <Child updateText={this.updateParentState.bind(this)} />
      </View>
    );
  }
}
```

## Android のBACKキーを無効化する方法

1. DidMount で設定を行う場合
StatusBar が有効なバージョンで動くかも

        import {StatusBar} from "react-native";
          
        componentDidMount() {
            StatusBar.setHidden(true, "fade");
        }

1. java とかで定義する場合
  getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);

1. 画面のフルスクリーンモードにする場合
  [allow for all Android FullScreen options](https://github.com/expo/expo/pull/7049)

1. app.json に設定を記載( React Native 38 からな行けるかも )
  [[android][navbar] allow for all Android FullScreen options](https://github.com/expo/expo/pull/7049)
  app.json

        "androidNavigationBar": {
          "visible": "immersive",
          "barStyle": "light-content",
          "backgroundColor": "#3689b1"
        }
        }
        }

1. Navigation Bar 部品なら
[Navigation Bar](https://ionicframework.com/docs/native/navigation-bar)

    import { NavigationBar } from '@ionic-native/navigation-bar/ngx';
    constructor(private navigationBar: NavigationBar) { }
    ...
    let autoHide: boolean = true;
    this.navigationBar.setUp(autoHide);

1. 追加モジュールを入れてみる
[react-native-navigation-bar-color](https://www.npmjs.com/package/react-native-navigation-bar-color)
  import { hideNavigationBar } from 'react-native-navigation-bar-color';
 ...
  hide = () => {
      hideNavigationBar();
  };
  
1. 

## 端末のBACKキーを無効化する場合
### iOS

navigationOptions: {
  gesturesEnabled: false,
},

## Android でデバッグ
1. adb start-server
1. adb devices


# Ethereum との連携
1. [geth 1.9.1アップデート](https://qiita.com/murata-tomohide/items/d16042536b661a22ca73)
1. 

# WSL2　をインストール
(WSL2導入｜WinアップデートからWSL2を既定にするまでのスクショ)[https://qiita.com/tomokei5634/items/27504849bb4353d8fef8]

1. (Windows10 を 2020 に更新)[https://www.microsoft.com/ja-jp/software-download/windows10]
1. (WSL 2 Linux カーネルの更新)[https://docs.microsoft.com/ja-jp/windows/wsl/wsl2-kernel]
1. WSL 2 に更新する
- 管理者権限のPowerShell で
> dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

- WSL2 を既定のバージョンとして設定する
> wsl --set-default-version 2

- 動作している WSL バージョンの確認
> wsl --list --verbose

# CentOS
- (WSL2のCentOSでもsystemdを利用する)[http://kozo.hatenablog.jp/entry/2020/05/06/202507]
- (CentOS に .NET Core SDK または .NET Core ランタイムをインストールする)[https://docs.microsoft.com/ja-jp/dotnet/core/install/linux-centos]


## Golang 
   - Windows に開発環境を入れる(Chocolatey でインストールする)
   [WindowsにGo言語をインストールする方法まとめ](https://qiita.com/yoskeoka/items/0dcc62a07bf5eb48dc4b)
     1. 管理者権限でコマンドプロンプトの起動
     1. Chocolateyのインストール
       > @"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"

     1. Go言語のインストール
       > choco install golang
       
     1. 開発ツールをインストール( 無くてもよい )
       > go get -u github.com/stamblerre/gocode
       > go get -u github.com/rogpeppe/godef
       
   - ubuntu で
     1. git clone か zip ファイルを取得
       wget https://github.com/ethereum/go-ethereum/archive/v1.9.15.zip
     1. [環境を揃える](https://github.com/golang/go/wiki/Ubuntu)
       ``` 
       $ sudo npm rm -g truffle
       
       $ sudo add-apt-repository ppa:longsleep/golang-backports
       $ sudo apt update
       $ sudo apt install golang-go
       $ sudo apt install -y bzr subversion
       $ sudo apt-get install -y build-essential libgmp3-dev
       
       $ curl -LO https://get.golang.org/$(uname)/go_installer && chmod +x go_installer && ./go_installer && rm go_installer

       $ sudo npm i -g truffle@4.1.16
       $ npm i --save ganache-cli
       $ npm i --save web3@1.0.0-beta.26
       $ npm i --save left-pad
       ``` 

## meta-transaction-master

   - AWS Linux で
     1. 各種インストール
```
$ sudo yum install docker-ce
   $ sudo yum install containerd.io
        $ sudo yum install container-selinux
$ sudo yum install docker-ce
$ sudo yum install docker

$ sudo service docker start
$ sudo usermod -a -G docker ec2-user
$ docker info
``` 
   - npm
``` 
$ npm i --save ethereumjs-tx
$ npm i --save keccak
$ sudo npm i -g ethereumjs-util
```


Ropsten
   
   1. npm の参照
   rootfs/usr/share/npm/package.json  
   "url": "https://github.com/npm/npm"  
   ↓
   "url": "https://github.com/npm/cli"  
   
   1. config.json の作成
```
{
  "server_account": {
    "privateKey": <PRIVATE KEY>,
    "address": <ADDRESS>
  },
  "client_account": {
    "privateKey": <PRIVATE KEY>,
    "address": <ADDRESS>
  }
}
```

msg.sender は使えない　TxRelay のアドレスになる為、
https://qiita.com/doskin/items/c4fd8952275c67deb594



## Ganache


## Solidity
   - スマートコントラクトとの開発言語
   
## 
   - ミドルウェア
   1. $ truffle version
```
Truffle v4.1.16 (core: 4.1.16)
Solidity v0.4.26 (solc-js)
```
   1. $ truffle develop
   1. truffle(develop)> compile
   1. truffle(develop)> migrate
   1. truffle(develop)> test
   
   1. 設定変更
   ( truffle-config.js の networks:{develop:{gas: を読むバー
    ジョンもある)
    - vi truffle
``` 
var default_tx_values = {
  gas: 672197500,
  gasPrice: 100000000000, // 100 Shannon,
  from: null
};
```
   truffle(develop)> web3.eth.getBlock("pending").gasLimit
   truffle(develop)> myToken = MyToken.at(MyToken.address)
   truffle(develop)> myToken.name()
   truffle(develop)> myToken.transfer(web3.eth.accounts[1], 1000e18)
   myToken.balanceOf(web3.eth.accounts[0])
   myToken.balanceOf(web3.eth.accounts[1])

## Ganasche

## コントラクト
Contract ABI Specification
https://solidity.readthedocs.io/en/v0.5.3/abi-spec.html

