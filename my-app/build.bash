#/bin/bash
echo "Pre Build : $0"

# 別途モジュールをインストールする事
#   npm install terser
npx terser \
    --compress --module \
    -m --wrap worker --ecma 2018 \
    -o ./public/worker.mjs ./src/worker.mjs
exit

HELP="
使用法: terser [オプション] [ファイル...]

オプション:
   -V、--version バージョン番号を出力します
   -p, --parse <オプション> パーサー オプションを指定します。
   -c, --compress [オプション] コンプレッサーを有効にする/コンプレッサー オプションを指定します。
   -m, --mangle [オプション] マングル名/マングラー オプションを指定します。
   --mangle-props [オプション] マングルのプロパティ/マングラーのオプションを指定します。
   -f, --format [オプション] フォーマットオプション。
   -b, --beautify [オプション] --format のエイリアス。
   -o, --output <file> 出力ファイル (デフォルトは STDOUT)。
   --comments [フィルタ] 出力内の著作権コメントを保持します。
   --config-file <file> JSON ファイルから minify() オプションを読み取ります。
   -d, --define <expr>[=value] グローバル定義。
   --ecma <バージョン> ECMAScript リリースを指定します: 5、2015、2016、または 2017...
   -e, --enclose [arg[,...][:value[,...]]] 構成可能な引数と値を使用して、出力を大きな関数に埋め込みます。
   --ie8 非標準の Internet Explorer 8 をサポートします。
   --keep-classnames クラス名をマングル/ドロップしません。
   --keep-fnames 関数名をマングル/ドロップしません。 Function.prototype.name に依存するコードに役立ちます。
   --module 入力は ES6 モジュールです
   --name-cache <file> 壊れた名前マッピングを保持するファイル。
   --rename 強制的にシンボルを展開します。
   --no-rename シンボル展開を無効にします。
   --safari10 非標準の Safari 10 をサポートします。
   --source-map [オプション] ソース マップを有効にする/ソース マップ オプションを指定します。
   --timings STDERR での操作の実行時間を表示します。
   --toplevel トップレベル スコープ内の変数を圧縮および/またはマングルします。
   --wrap <name> グローバルに「name」に対応する「exports」を使用して、すべてを関数として埋め込みます。
   -h、--help 使用方法に関する情報を出力します
"
