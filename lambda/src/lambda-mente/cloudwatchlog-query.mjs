/**
 * ログストリーム単位での削除
 *   ログストリームはログイベントの集まりで、通常は時間順にストリームが作成されます。
 *   特定の期間に対応するログストリームを削除することで、その期間のログを削除できます。
 *   エクスポートは s3 に /logs/Lambdaグループ名/タスクID/ログストリーム名/連番.gz  でファイルが作成されます。
 *
 */
import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  CreateExportTaskCommand,
  CancelExportTaskCommand,
  DescribeExportTasksCommand,
  //DeleteLogGroupCommand,
  DescribeLogStreamsCommand,
  DeleteLogStreamCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const cloudWatchLogsClient = new CloudWatchLogsClient();

const DEL_LOG_MIN = process.env.DEL_LOG_MIN ? Number(process.env.DEL_LOG_MIN) : 300 * 1024;
const DEL_LOG_MAX = process.env.DEL_LOG_MAX ? Number(process.env.DEL_LOG_MAX) : 50;
const DEL_LOG_DAY = process.env.DEL_LOG_DAY ? Number(process.env.DEL_LOG_DAY) : 7;

console.log('DEL_LOG_MIN:', DEL_LOG_MIN, 'DEL_LOG_MAX:', DEL_LOG_MAX, 'DEL_LOG_DAY:', DEL_LOG_DAY);

/**
 * 5. 取得したログストリームを削除
 */
async function streamsToDeleteMain(Recursive, mainObj, list) {
  const stream = list.pop();
  //console.log("streams :", stream);
  const { logGroupName, next, listFunc, resolveMain } = mainObj;

  // ログストリームの削除完了、ログストリームを取得かロググループの処理完了
  if (!stream) {
    if (next) listFunc(listFunc, mainObj, next);
    else resolveMain({ status: 0, msg: 'Del OK.' });
    return;
  }

  // ログストリームの削除
  const deleteLogStreamCommand = new DeleteLogStreamCommand({
    logGroupName,
    logStreamName: stream.logStreamName,
  });
  await cloudWatchLogsClient.send(deleteLogStreamCommand);
  console.log('Deleted log stream:', stream.logStreamName);

  // 次のログストリームを削除
  Recursive(Recursive, mainObj, list);
}

/**
 * 4. エクスポートタスクの完了後、削除対象のログストリームのリストを取得
 */
async function listLogs(Recursive, mainObj, Token = undefined) {
  const { fromTime: startTime, toTime: endTime, logGroupName, resolveMain } = mainObj;

  // ログストリームを取得
  const logs = {
    logGroupName,
    orderBy: 'LastEventTime',
    descending: false,
  };
  if (Token) logs.nextToken = Token;
  const describeLogStreamsCommand = new DescribeLogStreamsCommand(logs);
  const describeLogStreamsResponse = await cloudWatchLogsClient.send(describeLogStreamsCommand);
  console.log('Res LogStreams:', describeLogStreamsResponse);
  const next = describeLogStreamsResponse?.nextToken;

  // 取得できなければ、リトライかロググループの処理完了
  if (!describeLogStreamsResponse?.logStreams) {
    if (next) Recursive(Recursive, mainObj, next);
    else resolveMain({ status: 0, msg: 'Del OK.' });
    return;
  }

  // 削除対象のログストリーム一覧の作成
  console.log('streams time', startTime, endTime);
  const streamsToDelete = describeLogStreamsResponse.logStreams.filter((stream) => {
    const lastEventTimestamp = stream.lastEventTimestamp || 0;
    const check = lastEventTimestamp >= startTime && lastEventTimestamp <= endTime;
    //console.log("check streams", check, logGroupName);
    if (check) return stream;

    return null; // Res LogStreams
  });
  if (!streamsToDelete) {
    console.log('streams not found.');
    return;
  }

  // ログストリームを削除開始
  mainObj.next = next;
  mainObj.listFunc = Recursive;
  streamsToDeleteMain(streamsToDeleteMain, mainObj, streamsToDelete);
}

/**
 * 3.エクスポートタスクのポーリング関数
 */
async function exportPoring(obj) {
  const { taskId, isExportComplete, logGroupName } = obj;
  //console.log('EndCheck:', taskId, isExportComplete);

  // インターバルの停止
  if (isExportComplete) {
    if (obj.intervalID) {
      clearInterval(obj.intervalID);
      obj.intervalID = null;
    } else {
      return;
    }

    // エクスポートタスクの削除？
    // try {
    //   const command = new CancelExportTaskCommand({ taskId });
    //   const response = await cloudWatchLogsClient.send(command);
    //   console.log("Export task canceled successfully:", response);
    // } catch (error) {
    //   console.error("Error canceling export task:", error);
    // }

    // ログストリームの削除開始
    listLogs(listLogs, obj);
    return;
  }

  // エクスポートタスクの状態取得
  const describeExportTasksCommand = new DescribeExportTasksCommand({ taskId });
  const describeExportTasksResponse = await cloudWatchLogsClient.send(describeExportTasksCommand);
  const taskStatus = describeExportTasksResponse.exportTasks[0]?.status?.code;
  //console.log('Current Task Status:', taskStatus);

  // ポーリングの継続判定
  if (taskStatus === 'COMPLETED') {
    obj.isExportComplete = true;
    console.log(
      'Export Task Completed Successfully.',
      taskId,
      logGroupName,
      describeExportTasksResponse
    );
  } else if (taskStatus === 'FAILED') {
    throw new Error('Export Task Failed.');
  }
}

/**
 * 2. ロググループのエクスポートタスクを作成、実行
 */
async function exportMain(event) {
  // 最も古い
  // let 1607040000000 = Date.parse('04 Dec 2020 00:00:00 GMT');
  const {
    // エクスポート設定パラメータサンプル(ないと下記が使われる)
    logGroupName = '/aws/lambda/lambda-mente', // エクスポートしたいロググループ
    bucketName, // S3バケット名
    bucketPrefix = 'logs/', // S3バケット内のフォルダパス（任意）
    // fromTime = Date.now() - 7 * 24 * 60 * 60 * 1000, // 1週間前からのログ
    toTime = Date.now(), // 現在のログまで
    fromTime = 1607040000000, // 最も古いログから
    //toTime = Date.now() - DEL_LOG_DAY * 24 * 60 * 60 * 1000, // 1ヵ月前のログまで
  } = event;

  // エクスポートタスクを作成
  const taskP = {
    logGroupName,
    from: fromTime,
    to: toTime,
    destination: bucketName,
    //destinationPrefix: bucketPrefix, // + '/lambda-name'
    destinationPrefix: `logs${logGroupName}`,
    //taskName: `export-${logGroupName}-${Date.now()}`,
    taskName: `export-${logGroupName}`,
  };
  console.log('Export Task Params:', taskP);
  const exportTaskCommand = new CreateExportTaskCommand(taskP);
  const exportTaskResponse = await cloudWatchLogsClient.send(exportTaskCommand);
  console.log('Export Task Created:', exportTaskResponse.taskId);

  // 完了していなければ、少し待機してから再チェックするためのインターバル
  // 1つのログストリーム完了の resolve 関数の取得
  return new Promise((resolve) => {
    // ポーリング、終了の開始設定
    const obj = {
      logGroupName,
      fromTime,
      toTime,
      isExportComplete: false, // ポーリングステータス
      intervalID: null, // ポーリングID
      resolveMain: resolve, // エクスポート過料通知
      Loop: 0, // ログ用のポーリング回数
      taskId: exportTaskResponse.taskId,
    };

    // 完了コールバックで タイマー停止する
    obj.intervalID = setInterval(exportPoring, 1000, obj);
  });
}

/**
 * 1. ロググループの取得
 */
async function exportLogs(event, context) {
  const { logmin = DEL_LOG_MIN, delmax = DEL_LOG_MAX } = event;
  const functions = [];

  // なければエクスポート一覧を作成
  const logGroups = [];
  const getFuncs = async (func, resolve, nextToken = undefined) => {
    const command = new DescribeLogGroupsCommand({ nextToken });
    const response = await cloudWatchLogsClient.send(command);
    logGroups.push(...response.logGroups);
    if (response.nextToken) {
      func(func, resolve, response.nextToken);
    } else {
      resolve();
    }
  };
  await new Promise((resolve) => getFuncs(getFuncs, resolve));

  let count = 0;
  const list = logGroups
    .sort((a, b) => b.storedBytes - a.storedBytes) // ログのサイズが大きいほうから対象に
    .filter((input) => {
      // サイズ、個数で対象を絞る
      const { logGroupName, storedBytes } = input;
      console.log('back up log:', logGroupName, storedBytes);

      // 小さいログは対象外にする
      //if(storedBytes < (1024 * 1024 * 10)) return;// 10M までは対象にしない
      if (storedBytes < logmin) return false;

      // 同時実行数の制限50 があるため、50以上は対象としない
      if (count++ > delmax) return false;

      return true;
    });

  list.forEach((input) => {
    const { logGroupName, storedBytes } = input;
    console.log('back up log:', logGroupName, storedBytes, context.getRemainingTimeInMillis());

    // Lambda の実行時間15分制限があるため、ここで残り時間がなければこれ以上行わない
    // https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/nodejs-context.html
    if (context.getRemainingTimeInMillis() < 60000) return;

    // エクスポートと削除の開始
    functions.push(exportMain({ ...event, logGroupName }));
  });

  // 完了まち
  await Promise.all(functions);
}

// スクリプトを実行
export { queryLogs };
