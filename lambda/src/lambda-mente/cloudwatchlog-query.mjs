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
  StartQueryCommand,
  GetQueryResultsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const logsClient = new CloudWatchLogsClient();
const s3Client = new S3Client();

const LOG_QUERY = process.env.LOG_QUERY || '';

function getFileName(ev, ctx) {
  const tmp1 = '/tmp/cloudwatchlogQuery1-' + ctx.awsRequestId;
  const tmp2 = '/tmp/cloudwatchlogQuery2-' + ctx.awsRequestId;
  const out = 'cloudwatchlogQuery/20240215.cvs';
  const idx = 'cloudwatchlogQuery/index.txt';
  const bucketName = '';

  return { idx, out, tmp1, tmp2, bucketName };
}

async function uploadFile(type, param) {
  const Key = type ? param.out : param.idx;
  const tmp = type ? param.tmp1 : param.tmp2;

  const fileStream = fs.createReadStream(tmp);
  const uploadParams = {
    Bucket: param.bucketName,
    Key,
    Body: fileStream,
    ContentType: 'application/octet-stream', // 適宜変更
  };

  const command = new PutObjectCommand(uploadParams);
  await s3Client.send(command);
  console.log(`File uploaded successfully: s3://${param.bucketName}/${Key}`);
}

async function downloadFile(type, param) {
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
function listLogGroup(queryLogObj) {
  const getFuncs = async (param) => {
    const { func, nextToken } = param;

    const command = new DescribeLogGroupsCommand({ nextToken });
    const response = await logsClient.send(command);
    param.nextToken = response.nextToken;
    console.log('list response', response);

    // 対象のフィルタ
    // 50以上なら qcb を複数回呼ぶ
    const logGroups = [];
    response?.logGroups?.forEach(({ storedBytes, logGroupName }) => {
      if (storedBytes === 0) return;

      logGroups.push(logGroupName);
    });
    const qp = { ...queryLogObj, logGroups };
    param.qcb(qp);

    if (param.nextToken) {
      param.lfunc(param);
    } else {
      console.log('list END.');
    }
  };

  getFuncs({ ...queryLogObj, lfunc: getFuncs });
}

function queryLog(queryLogObj) {
  console.log('queryLog start.');

  // クエリー開始
  const query = async (obj) => {
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
  const waitLog = async (obj) => {
    const { queryId, qth, resolve } = obj;
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
      obj.wcb(wp);
      if (queryLogObj.listEnd) {
        resolve();
      }
    }
  };

  query({ ...queryLogObj, qfunc: waitLog });
}

async function writeLog(queryLogObj) {
  console.log('writeLog start.');
}

let ok = null;

async function queryLogs(ev, ctx) {
  const { query = null } = ev;
  const jst = new Date().toLocaleString({ timeZone: 'Asia/Tokyo' });
  console.log('jst', jst);

  const startTime = new Date();
  startTime.setHours(startTime.getHours() - 24); // 24時間前
  const param = {
    startTime,
    endTime: new Date(),
    queryString: `
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 20
`,
    qcb: queryLog,
    wcb: writeLog,
  };

  let ok = null;

  await new Promise((ok, ng) => {
    param.resolve = ok;
    try {
      listLogGroup(param);
    } catch (e) {
      console.error(e);
      ng(e);
    }
  });
  return;
}

export const handler = async (event, context, callback) => {
  ok = 'a';
  return await queryLogs(event, context, ok);
};

if (ok) {
  ok = 2;
  if (ok == 2) {
    ok = 3;
    if (ok === 3) {
      ok = 5;
      if (ok === 3) {
        ok = 5;
        if (ok === 3) {
          ok = 5;
          if (ok === 3) {
            ok = 5;
            if (ok === 3) {
              ok = 5;
              if (ok === 3) {
                ok = 5;
              }
            }
          }
        }
      }
    }
  }
}

// スクリプトを実行
export { queryLogs };
