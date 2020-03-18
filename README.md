// -*- coding: utf-8-unix -*-

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

---
npm start

---
expo export --dev --public-url <your-url-here>
python --version
 If Python version returned above is 2.X,
 try to use python3 instead
python -m http.server

expo export --public-url http://127.0.0.1:19000

----------------------------------------

'expo'.

----------------------------------------
# 画面

01.
02. Page1DetailScreen.js
03. Page1DetailScreen2.js



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

APK を作成する
https://www.robincussol.com/build-standalone-expo-apk-ipa-with-turtle-cli/

- コンソール１
1)
$ sudo update-alternatives --config java
$ sudo npm start --unsafe-perm --verbose

- コンソール２
2)
$ python http_server.py
4)
$ cd dist
$ python ../http_server.py

- コンソール３
3)
$ expo export --dev --public-url http://127.0.0.1:8000
5)
$ sudo turtle setup:android --sdk-version 36.0.0
$ keytool -genkeypair -v -keystore keystore.jks -alias keyalias -keyalg RSA -keysize 2048 -validity 9125
$ EXPO_ANDROID_KEYSTORE_PASSWORD="keystorepassword" \
  EXPO_ANDROID_KEY_PASSWORD="keypassword" \
  turtle build:android \
    --type apk \
    --keystore-path ./should-be-private/keystore.jks \
    --keystore-alias "keyalias" \
    --public-url http://127.0.0.1:8000/dist/android-index.json
 
----------------------------------------
react-native bundle --platform android --dev false --entry-file index.android.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/


----------------------------------------
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

----------------------------------------
Warning: Page1ScreenDetail: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). This component defines getSnapshotBeforeUpdate() only.


--------------------------------------------------------------------------------
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
# 画像に回転するようなアニメーションを行う
```
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
----------------------------------------
# 
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

----------------------------------------
# 

--- 1
ERROR in ./web-build/register-service-worker.js
Module build failed (from C:/ProgramData/nvm/v10.14.2/node_modules/expo-cli/node_modules/babel-loader/lib/index.js):
Error: ENOENT: no such file or directory, open 'i:\Android\ReactNativeSample\web-build\register-service-worker.js'
 @ multi ./web-build/register-service-worker.js ./node_modules/expo/AppEntry.js app[0]
i ｢wdm｣: Failed to compile.

C:\Users\kazu\AppData\Roaming\npm-cache\_logs\2020-03-27T22_22_53_238Z-debug.log

--- 2
import {StatusBar} from "react-native";

componentDidMount() {
    StatusBar.setHidden(true, "fade");
}
--- 3
getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);

--- 4
(allow for all Android FullScreen options)[https://github.com/expo/expo/pull/7049]

--- 5
([android][navbar] allow for all Android FullScreen options)[https://github.com/expo/expo/pull/7049]
app.json

    "androidNavigationBar": {
      "visible": "immersive",
      "barStyle": "light-content",
      "backgroundColor": "#3689b1"
    }
  }
}

--- 6
(Navigation Bar)[https://ionicframework.com/docs/native/navigation-bar]

import { NavigationBar } from '@ionic-native/navigation-bar/ngx';
constructor(private navigationBar: NavigationBar) { }
...
let autoHide: boolean = true;
this.navigationBar.setUp(autoHide);

--- 7
(react-native-navigation-bar-color)[https://www.npmjs.com/package/react-native-navigation-bar-color]
  import { hideNavigationBar } from 'react-native-navigation-bar-color';
 ...
  hide = () => {
      hideNavigationBar();
  };
--- 8

iOS

navigationOptions: {
  gesturesEnabled: false,
},

