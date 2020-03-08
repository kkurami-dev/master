
expo install react-navigation
expo install react-navigation-stack 
expo install react-navigation-tabs 
expo install react-native-gesture-handler 
expo install react-native-reanimated
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
$ npm start

- コンソール２
2)
$ python http_server.py
4)
$ cd dist
$ python ../http_server.py

- コンソール３
3)
$ expo export --public-url http://127.0.0.1:8000
5)
$ sudo turtle setup:android --sdk-version 36.0.0
$ keytool -genkeypair -v -keystore keystore.jks -alias keyalias -keyalg RSA -keysize 2048 -validity 9125
$ EXPO_ANDROID_KEYSTORE_PASSWORD="keystorepassword" \
  EXPO_ANDROID_KEY_PASSWORD="keypassword" \
  turtle build:android \
    --type apk \
    --keystore-path ./should-be-private/keystore.jks \
    --keystore-alias "keyalias" \
    --public-url http://127.0.0.1:8000/android-index.json
 
