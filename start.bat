:: -*- coding: shift_jis-dos -*-

cd %~dp0

set NODE_ENV=production

call npm i -s npm i react-native-input-spinner

call npm i
call npm start --minify -c --clearCache

exit


-s メールアドレス or 電話番号　# urlをそれぞれメールやSMSに送ってくれます
-c                           # キャッシュを削除して実行
-m "tunnel" or "lan" or "localhost" # 実行するスコープを選択できます。詳しくは個別のオプション参照
--tunnel                     # ネットワークの外部から接続できます。
--lan                        # LAN内から見れます
--localhost                  # 同一ネットワークからのみ接続できます
--minify                     # minifyすることで転送速度が速くなります
--dev                        # 一緒にchromeのdeveloperツールが開きます
--no-dev                     # 開きません

* componentWillMountの名前をUNSAFE_componentWillMountに変更して、非厳密モードでこの警告を抑制します。 React 17.xでは、UNSAFE_名のみが機能します。 廃止されたすべてのライフサイクルの名前を新しい名前に変更するには、プロジェクトソースフォルダーで `npx react-codemod rename-unsafe-lifecycles`を実行します。

npx react-codemod rename-unsafe-lifecycles
