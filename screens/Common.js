import { StyleSheet, Dimensions, AsyncStorage } from 'react-native';
import Storage from 'react-native-storage';

const wWidth = Dimensions.get('window').width;
const wHeight = Dimensions.get('window').height;

//ストレージの設定
var storage = new Storage({
    // 最大容量, 1000がデフォルト 
    size: 1000,
 
    // AsyncStorageを使う（WEBでもRNでも）。
    // セットしないとリロードでデータが消えるよ。
    storageBackend: AsyncStorage,
     
    // （たぶん）キャッシュの期限。デフォルトは一日(1000 * 3600 * 24 milliseconds).
    // nullにも設定できて、期限なしの意味になるよ。
    defaultExpires: 1000 * 3600 * 24,
     
    // メモリにキャッシュするかどうか。デフォルトは true。
    enableCache: true,
     
    // リモートシンクの設定（だと思う。）
    sync : {
        // これについては後述
    }
})

function StorageSave() {
  storage.save({
    key: 'sample',
    id: '1234',
    data: {
      'name' : 'mimi',
      'status' : 'nemui'
    },
  });
}

function StorageLoad() {
  storage.load({
    key: 'sample',
    id: '1234'
  }).then(ret => {
    // ロードに成功したら
    console.log(ret.name + ' is ' + ret.status);
  }).catch(err => {
    // ロードに失敗したら
    console.warn(err.message);
    switch (err.name) {
    case 'NotFoundError':
      // 見つかんなかった場合の処理を書こう
      break;
    case 'ExpiredError':
      // キャッシュ切れの場合の処理を書こう
      break;
    }
  });
}

const mystyle = StyleSheet.create({
  container: {
    flex: 1,
    //width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    //alignItems: 'center',
    //justifyContent: 'center',
  },
  container1: {
    flex: 1,
    width: "100%",
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C2C2C2',
  },
  container2: {
    flex: 1,
    width: "100%",
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  button: {
    width: '90%',
    marginBottom: 10,
    //borderRadius: '12px',
    marginVertical: 10,
    //alignItems: 'center',
    //borderRadius: 10,
    borderRadius: 15,
    borderWidth: 1,
    overflow: "hidden"
  },
});


export  { mystyle, }
