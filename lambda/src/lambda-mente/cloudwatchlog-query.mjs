/**
 * 指定AWSアカウント内のCloudWatchのエラーを収集する
 *   ログストリームはログイベントの集まりで、通常は時間順にストリームが作成されます。
 *   特定の期間に対応するログストリームを削除することで、その期間のログを削除できます。
 *   エクスポートは s3 に /logs/Lambdaグループ名/タスクID/ログストリーム名/連番.gz
 *   でファイルが作成されます。
 *
下記の全体と要件で Nodejs を使い aws lambda のソースを作成してください
前提
  1.aws sdk は v3 を使用する事
  2.処理はなるべく関数化すること
  3.Lambdaの最大実行時間は 14 分で続きは次回実行時に行う
  4.Lambda のパラメータで下記を設定できるようにする
  ・バケット名
  ・StartQueryCommand のクエリー分
要件
 1. DescribeLogGroupsCommand でロググループの一覧を作成
 2. 1 の内容は s3 に検索結果としてログクループ名、ログサイズの保存を行う
 3. CludWatch Log のログサイズが０の場合は何もしない
 4. 2 のファイルが存在していた場合、2の記録されているログサイズと今回のサイズが同一なら何もしない
 5. ログクループ名を配列に保持
 6. 5 の件数が 50 件に達したら、StartQueryCommand を実行し、配列に保持
 7. すべてのロググループの判定が完了し、5 の配列に端数がある場合、残り分について 6 を実行
 8. 6 の配列を非同期に GetQueryResultsCommand 実行状態を取得し、ログ取得が完了していた場合、結果を今日の日付で s3 に書き出す
 *
 */
import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  StartQueryCommand,
  GetQueryResultsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const logsClient = new CloudWatchLogsClient();
const s3Client = new S3Client();

const LOG_QUERY = process.env.LOG_QUERY || `
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 20
`;

function getFileName(ctx) {
  const tmp1 = '/tmp/cloudwatchlogQuery1-' + ctx.awsRequestId;
  const tmp2 = '/tmp/cloudwatchlogQuery2-' + ctx.awsRequestId;
  const out = 'cloudwatchlogQuery/20240215.cvs';
  const idx = 'cloudwatchlogQuery/index.txt';
  const bucketName = '';

  return { idx, out, tmp1, tmp2, bucketName };
}

async function uploadFile(type, ctx, mode) {
  const param = getFileName(ctx);
  const Key = type ? param.out : param.idx;
  const tmp = type ? param.tmp1 : param.tmp2;

  let Body = "";
  let ContentType = 'application/octet-stream';
  if(mode){
    Body = JSON.stringify(mode);
    ContentType = null;
  } else {
    Body = fs.createReadStream(tmp);
  }
  const uploadParams = {
    Bucket: param.bucketName,
    Key,
    Body,
    ContentType, // 適宜変更
  };

  const command = new PutObjectCommand(uploadParams);
  await s3Client.send(command);
  console.log(`File uploaded successfully: s3://${param.bucketName}/${Key}`);
}

async function downloadFile(type, ctx) {
  const param = getFileName(ctx);
  const Key = type ? param.out : param.idx;

  try {
    const command = new GetObjectCommand({ Bucket: param.bucketName, Key });
    const { Body } = await s3Client.send(command);
    const str = await Body.transformToString();
    return JSON.parse(str);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
  return {};
}

// ロググループをすべてリストアップする
/*
  setTimeout(callback, 0) を指定しても、即時実行されるわけではなく、
  次のイベントループのタイミング で実行されます。
  これは Node.js のイベントループ の仕組みによるもので、setTimeout は
  タスクキュー（Timer Queue） に追加され、現在の実行中のコードがすべて
  終わった後に処理されます。
 */
async function listLogGroup(queryLogObj, ctx) {

  const oldfuncs = await downloadFile(0, ctx);
  const newfuncs = {
    funcs:{}
  };

  // ロググループの選定
  async function getFuncs(param){
    const { func, nextToken } = param;

    const command = new DescribeLogGroupsCommand({ nextToken });
    const response = await logsClient.send(command);
    param.nextToken = response.nextToken;
    console.log('list response', response);

    // 対象のフィルタ
    // ・50以上なら qcb を複数回呼ぶ
    // ・サイズが０なら無視
    // ・前回とサイズが同じなら無視
    let logcount = 0;
    let logGroups = [];
    response?.logGroups?.forEach(function ({ storedBytes, logGroupName }, idx){
      newfuncs.funcs[logGroupName] = storedBytes;
      if (storedBytes === 0) return;
      if (oldfuncs.funcs[logGroupName] === storedBytes) return;

      logGroups.push(logGroupName);
      logcount += 1;
      if(logGroups.length > 49){
        const listEnd = (!param.nextToken && response.logGroups.length === (idx + 1));
        param.qcb({ ...queryLogObj, logGroups, listEnd });
        logGroups = [];
      }
    });
    if(logGroups.length){
      const listEnd = !param.nextToken;
      param.qcb({ ...queryLogObj, logGroups, listEnd });
    }

    if (logcount === 0 && !param.nextToken) {
      param.resolve();
    } else if (param.nextToken) {
      param.lfunc(param);
    } else {
      await uploadFile(0, ctx, newfuncs);
      console.log('list END.');
    }
  };

  // 選定の開始
  getFuncs({ ...queryLogObj, lfunc: getFuncs });
}

function queryLogExecute(queryLogObj) {
  console.log('queryLog start.');

  // クエリー開始
  async function query(obj){
    const { logGroup, queryString, startTime, endTime } = obj;
    const startQueryCommand = new StartQueryCommand({
      logGroupNames: logGroup, // クエリー対象のロググループ
      startTime: startTime.getTime(), // ミリ秒単位の Unix タイムスタンプ
      endTime: endTime.getTime(),
      queryString: queryString,
    });
    const { queryId } = await logsClient.send(startQueryCommand);

    obj.queryId = queryId;
    obj.qth = setTimeout(obj.qfunc, 1000, obj);
  };

  // クエリー結果待ち
  async function waitLog(obj){
    const { queryId, qth } = obj;
    obj.qth = null;
    clearTimeout(qth);

    const getQueryResultsCommand = new GetQueryResultsCommand({ queryId });
    const response = await logsClient.send(getQueryResultsCommand);
    const { status, results } = response;
    if (status === 'Running' || status === 'Scheduled') {
      obj.qth = setTimeout(obj.qfunc, 1000, obj);
    } else {
      console.log('query END response', response);
      const wp = { ...queryLogObj, response };
      await obj.wcb(wp);
      if (queryLogObj.listEnd) {
        obj.resolve();
      }
    }
  };

  // クエリーの実行
  query({ ...queryLogObj, qfunc: waitLog });
}

async function writeLog(queryLogObj) {
  console.log('writeLog start.');
}

async function queryLambdaAllLog(ev, ctx) {
  const { query = null } = ev;
  const jst = new Date().toLocaleString({ timeZone: 'Asia/Tokyo' });
  console.log('jst', jst);

  const startTime = new Date();
  startTime.setHours(startTime.getHours() - 24); // 24時間前
  const param = {
    // 対象時間範囲
    startTime, endTime: new Date(),
    // 対象のログ検索クエリ
    queryString: LOG_QUERY,
    // 対象の検索、実行結果の保存
    qcb: queryLogExecute, wcb: writeLog,
  };

  await new Promise(function (ok, ng){
    param.resolve = ok;
    try {
      listLogGroup(param, ctx);
    } catch (e) {
      console.error(e);
      ng(e);
    }
  });
  return;
}

async function handler(event, context, callback){
  return await queryLambdaAllLog(event, context, callback);
};

// スクリプトを実行
export {
  handler,
  queryLogs
};
