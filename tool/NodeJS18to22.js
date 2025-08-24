/*
  ① ツール概要
    Node.js 18 から 22 への移行で、下記のような定型修正を自動化します。
    ・廃止予定APIの置き換え（例：fs.exists → fs.existsSync）
    ・fetch() の標準化対応
    ・ESM / CommonJS 関連の互換修正
    ・新しいグローバルAPIの利用推奨に置き換え
    ・Deprecation Warning に対する自動修正
    このツールは AI（OpenAI API）+ jscodeshift（コード変換用ASTツール）を組み合わせて動きます。

  ② 必要なもの
    Node.js v18 以上（変換実行は新しいNodeでOK）
    npm または yarn
    OpenAI APIキー（または互換APIキー）  

  ③ セットアップ手順（例）
    # プロジェクト作成
    mkdir node18to22-ai-migrate
    cd node18to22-ai-migrate
    npm init -y

    # 必要パッケージインストール
    npm install jscodeshift openai dotenv

    続きは 第2回 で「変換スクリプトの作成方法」を説明します。
    ここまでで、環境は整った状態になります。

  ④ 変換スクリプトの作成
    まず migrate.js というファイルを作成し、以下のように書きます。

  ⑤ 実行方法
    環境変数にAPIキーを設定
    .env ファイルに以下を追加します。
    ~~~
    OPENAI_API_KEY=sk-xxxx...
    ~~~
    スクリプトを実行
    ターミナルで以下を実行します。
    
    $ node migrate.js
  
    変換結果の確認
    実行後、src 以下のファイルが上書きされます。
    Git を使っている場合は事前にコミットして差分を確認してください。
    AIの提案を鵜呑みにせず、必ず手動レビューを行います。

  ⑥ 注意点
    APIコスト
      変換対象ファイルが多いと OpenAI API の使用料金が高くなります。
      必要に応じてファイル単位で処理してください。
    変換精度
      AIは文脈を考慮しますが、すべての非推奨APIや挙動差を完全にカバーできるわけではありません。
      公式の Node.js v22 changelog を参照して手動確認してください。
    安全対策
      直接上書きせず、別ディレクトリに保存して比較レビューする運用もおすすめです。

*/

// Amazon Bedrock
// Node.js 18→22 AI変換ツール (AWS Bedrock版)

import fs from 'fs';
import path from 'path';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// AWS Bedrock クライアント
const client = new BedrockRuntimeClient({ region: 'us-east-1' });

////////////////////////////////////////////////////////////////////////////////
// 各種設定

// 対象ディレクトリ
const targetDir = './src';

// 実行モード
//   0: 必要かのチェックのみ
//   1: 変換実行
const execMode = 0;

// Day.js 変換を有効にするかどうかのパラメータ
//   0: moment のチェックしない
//   1: moment もチェック
//   2: moment のみチェック
const useDayjs = 1;

const migrationGuide = `
あなたはNode.jsの移行エキスパートです。
対象コードをNode.js v18からv22に移行するためのソースコードの変換を行ってください。
考慮点:
  1. 廃止予定APIの置き換え
  2. fetch() の標準対応
  3. ESM/CommonJS の互換性
  4. グローバルなAPIの利用推奨APIへの変更
  5. Deprecation Warning の解消
返答は修正版のソースコードのみ出力してください。
`;

// 同時に実行するファイルの多重度
const concurrency = 6;

// 変換精度
const max_tokens = 1500;

////////////////////////////////////////////////////////////////////////////////

// Bedrockモデルの料金（仮定: $0.03 / 1k tokens）
const modelCostPerThousandTokens = 0.03;
const usdToJpy = 150; // 仮換算レート（例: 1 USD = 150 JPY）
let totalTokensUsed = 0;

// ファイル再帰取得
function getFiles(dir) {
  return fs.readdirSync(dir).flatMap(file => {
    const filepath = path.join(dir, file);
    return fs.statSync(filepath).isDirectory()
      ? getFiles(filepath)
      : filepath.endsWith('.js') || filepath.endsWith('.mjs')
      ? [filepath]
      : [];
  });
}

// 変更が必要か簡易チェック
function needsMigration(code) {
  let deprecatedPatterns = [
    /require\(/, /module\.exports/, /fs\./, /url\.parse/,
    /crypto\.createCipher\(/, /new Buffer\(/,
    /\Wvar\W/,
  ];
  if(useDayjs === 1){
    deprecatedPatterns.push(/\Wmoment\w*\(/);
  } else if (useDayjs === 2) {
    deprecatedPatterns = [/\Wmoment\w*\(/];
  }
  return deprecatedPatterns.some(pattern => pattern.test(code));
}

// ファイルサイズからトークン概算を計算
function estimateTokensFromSize(filePath) {
  const stats = fs.statSync(filePath);
  const bytes = stats.size;
  // 1 token ≈ 4 bytesとして概算
  return Math.ceil(bytes / 4);
}

// AI変換実行
async function transformWithBedrock(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');

  if (!needsMigration(code)) {
    if(execMode === 1){
      console.log(`！ 変更不要と判断: ${filePath}`);
    }
    return 0;
  }
  if(execMode === 0){
    console.log(`変更必要と判断: ${filePath}`);
    return estimateTokensFromSize(filePath);
  }

  //let prompt = `Node.js 18から22への移行用に以下のコードを変換してください:`;
  let prompt = migrationGuide;
  if (useDayjs === 1) {
    prompt += `
momentライブラリをDay.jsに置き換える変換も適用してください。
`;
  } else if (useDayjs === 2) {
    prompt = `momentライブラリをDay.jsに置き換える変換を適用してください。
`;
  }
  prompt += `ソースコードは以下です\n${code}`;

  const input = {
    modelId: 'anthropic.claude-3', // またはBedrockの利用可能モデルID
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      max_tokens
    })
  };

  const command = new InvokeModelCommand(input);
  const response = await client.send(command);
  const resultText = new TextDecoder().decode(response.body);

  fs.writeFileSync(filePath, resultText, 'utf-8');
  console.log(`◎ 変換完了: ${filePath}`);

  return estimateTokensFromSize(filePath);
}

// 実行（同時6ファイルまで並列処理）
(async () => {
  const files = getFiles(targetDir);

  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const tokensUsedBatch =
          await Promise.all(batch.map(file => transformWithBedrock(file)));
    totalTokensUsed += tokensUsedBatch.reduce((a, b) => a + b, 0);
  }

  const estimatedCostUSD = (totalTokensUsed / 1000) * modelCostPerThousandTokens;
  const estimatedCostJPY = estimatedCostUSD * usdToJpy;
  console.log(`Bedrock使用料金の概算: ¥${estimatedCostJPY.toFixed(0)} JPY`);
})();
