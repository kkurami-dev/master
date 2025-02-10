/**
 * 指定AWSアカウント内のCloudWatchのエラーを収集する
 *   ログストリームはログイベントの集まりで、通常は時間順にストリームが作成されます。
 *   特定の期間に対応するログストリームを削除することで、その期間のログを削除できます。
 *   エクスポートは s3 に /logs/Lambdaグループ名/タスクID/ログストリーム名/連番.gz
 *   でファイルが作成されます。
 *
 */
import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const logsClient = new CloudWatchLogsClient();
const s3Client = new S3Client();

const LOG_QUERY = process.env.LOG_QUERY || "";

function getFileName(ev, ctx){



  const tmp1 = '/tmp/cloudwatchlogQuery1-';
  const tmp2 = '/tmp/cloudwatchlogQuery2-';
  const out = 'cloudwatchlogQuery/';
  const idx = 'cloudwatchlogQuery/index.txt';
  const bucketName = "";

  return {idx, out, tmp1, tmp2, bucketName};
}

async function uploadFile(type, param) {
  const Key = type ? param.out : param.idx;
  const tmp = type ? param.tmp1 : param.tmp2;

  const fileStream = fs.createReadStream(tmp);
  const uploadParams = {
    Bucket: param.bucketName,
    Key,
    Body: fileStream,
    ContentType: "application/octet-stream", // 適宜変更
  };

  const command = new PutObjectCommand(uploadParams);
  await s3Client.send(command);
  console.log(`File uploaded successfully: s3://${param.bucketName}/${Key}`);
}

async function downloadFile(type, param) {
  const Key = type ? param.out : param.idx;
  const tmp = type ? param.tmp1 : param.tmp2;

  let data = {};
  try {
    const command = new GetObjectCommand({ Bucket: param.bucketName, Key });
    const { Body } = await s3Client.send(command);

    const fileStream = fs.createWriteStream(tmp);
    Body.pipe(fileStream);

    console.log(`File downloaded: ${tmp}`);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
  return data;
}

// ロググループをすべてリストアップする
/*
  setTimeout(callback, 0) を指定しても、即時実行されるわけではなく、
  次のイベントループのタイミング で実行されます。
  これは Node.js のイベントループ の仕組みによるもので、setTimeout は
  タスクキュー（Timer Queue） に追加され、現在の実行中のコードがすべて
  終わった後に処理されます。
 */
async function listLogGroup( cb ){
  const getFuncs = async (param) => {
    const {func, nextToken, ti} = param;
    param.ti = null;
    clearTimeout( ti );

    const command = new DescribeLogGroupsCommand({ nextToken });
    const response = await logsClient.send(command);

    await cb( response );

    if( response.nextToken ){
      param.nextToken = response.nextToken;
      param.ti = setTimeout( func, 0, obj );
    }
  };

  const obj = {
    ti: null,
    func: getFuncs,
  };
  obj.ti = setTimeout(getFuncs, 0, obj);
}

async function queryLogs(ev, ctx){
  const {query = null} = ev;

  listLogGroup( cb );
}

// スクリプトを実行
export { queryLogs };
