import {
  CloudWatchLogsClient,
  CreateExportTaskCommand,
  DescribeExportTasksCommand,

  //DeleteLogGroupCommand,
  DescribeLogStreamsCommand,
  DeleteLogStreamCommand,
} from '@aws-sdk/client-cloudwatch-logs';
const cloudWatchLogsClient = new CloudWatchLogsClient();

/**
 * ログストリーム単位での削除
 *   ログストリームはログイベントの集まりで、通常は時間順にストリームが作成されます。
 *   特定の期間に対応するログストリームを削除することで、その期間のログを削除できます。
 * 
 * ステップ:
 * 1.ログストリームのリストを取得:
 *     対象のロググループ内のログストリームを時系列で取得します。
 * 
 * 2.対象期間のログストリームをフィルタリング:
 *     取得したログストリームから、削除したい期間に該当するストリームをフィルタリングします。
 * 
 * 3.該当するログストリームを削除:
 *     対象のログストリームを削除します。
 */
function deleteLogsByPeriod(param = {}) {
  // パラメータサンプル
  const {
    logGroupName = '/aws/lambda/my-log-group', // ロググループ名
    startTime = new Date('2024-01-01T00:00:00Z').getTime(), // 開始期間
    endTime = new Date('2024-02-01T00:00:00Z').getTime(), // 終了期間
  } = param;

  async function DelLoop(cb, resolve, Token = undefined){
    const describeLogStreamsCommand = new DescribeLogStreamsCommand({
      logGroupName,
      orderBy: 'LastEventTime',
      descending: false,
      nextToken: Token,
    });

    // ログストリームを取得
    const describeLogStreamsResponse = await cloudWatchLogsClient.send(
      describeLogStreamsCommand
    );
    const next = describeLogStreamsResponse.nextToken;

    const streamsToDelete = describeLogStreamsResponse.logStreams.filter((stream) => {
      const lastEventTimestamp = stream.lastEventTimestamp || 0;
      return lastEventTimestamp >= startTime && lastEventTimestamp <= endTime;
    });

    // ログストリームを削除
    for (const stream of streamsToDelete) {
      const deleteLogStreamCommand = new DeleteLogStreamCommand({
        logGroupName,
        logStreamName: stream.logStreamName,
      });
      await cloudWatchLogsClient.send(deleteLogStreamCommand);
      console.log(`Deleted log stream: ${stream.logStreamName}`);
    }

    // 続きか終了
    if( next ) cb( cb, resolve, next );
    else resolve({ status:0 , msg: "Del OK." });
  }

  // 削除の開始
  return new Promise((resolve) => {
    DelLoop( DelLoop, resolve );
  })
}

/**
 * CloudWatch のログをS3にエクスポートし、エクスポート完了後にCloudWatchからログを削除する
 *
 * エクスポートタスクの作成:
 * 1. CreateExportTaskCommand を使用して、指定した期間のログをS3にエクスポートするタスクを作成します。
 *
 * 2. エクスポートタスクの完了待機:
 *    DescribeExportTasksCommand を使用して、エクスポートタスクのステータスを定期的に確認し、
 *    タスクが完了するまで待機します。
 *
 * 3.ロググループの削除:
 *   エクスポートが完了したら、DeleteLogGroupCommand を使用してロググループを削除します。
 */

// 2.エクスポートタスクのポーリング関数
async function EndCheck(obj){
  console.log('EndCheck:', obj.Loop++);

  // エクスポート完了処理の実施
  if (obj.isExportComplete) {
    await obj.PolingEndFunc(obj);
    return;
  }

  const describeExportTasksCommand = new DescribeExportTasksCommand({
    taskId: obj.taskId,
  });

  const describeExportTasksResponse = await cloudWatchLogsClient.send(describeExportTasksCommand);
  const taskStatus = describeExportTasksResponse.exportTasks[0]?.status?.code;

  console.log('Current Task Status:', taskStatus);

  if (taskStatus === 'COMPLETED') {
    obj.isExportComplete = true;
    console.log('Export Task Completed Successfully.');
  } else if (taskStatus === 'FAILED') {
    throw new Error('Export Task Failed.');
  }
};

// 3.エクスポートタスクの完了処理関数
async function PolingEndFunc({ intervalID, resolve, logGroupName, fromTime, toTime }){
  // ポーリング停止
  clearInterval(intervalID);

  // エクスポートタスクを削除

  // ロググループを削除
  // const deleteLogGroupCommand = new DeleteLogGroupCommand({ logGroupName });
  // cloudWatchLogsClient.send(deleteLogGroupCommand);
  // console.log(`Log group ${logGroupName} deleted successfully.`);
  // ログストリームの削除
  await deleteLogsByPeriod({
    logGroupName,
    startTime: fromTime,
    endTime: toTime,
  });

  // 削除完了を上位に通知
  resolve({ status: 0 });
};

// Lmabda 事のループ
async function exportLogsMain(event = {}) {
  // パラメータサンプル
  const {
    // エクスポート設定
    logGroupName = '/aws/lambda/lambda-mente', // エクスポートしたいロググループ
    bucketName = 'kkk-wss-test', // S3バケット名
    bucketPrefix = 'logs/', // S3バケット内のフォルダパス（任意）
    fromTime = Date.now() - 7 * 24 * 60 * 60 * 1000, // 1週間前からのログ
    toTime = Date.now(), // 現在のログまで
  } = event;

  // エクスポートタスクを作成
  const exportTaskCommand = new CreateExportTaskCommand({
    logGroupName,
    from: fromTime,
    to: toTime,
    destination: bucketName,
    destinationPrefix: bucketPrefix, // + '/lambda-name'
    taskName: `export-${logGroupName}-${Date.now()}`,
  });

  const exportTaskResponse = await cloudWatchLogsClient.send(exportTaskCommand);
  console.log('Export Task Created:', exportTaskResponse.taskId);

  // 完了を待つための Promise を返す
  return new Promise((resolve) => {
    // ポーリング、終了の開始設定
    const obj = {
      isExportComplete: false, // ポーリングステータス
      PolingEndFunc, // ポーリング終了時の関数
      intervalID: null, // ポーリングID
      resolve, // エクスポート過料通知
      Loop: 0, // ログ用のポーリング回数
      taskId: exportTaskResponse.taskId,
      event,
    };

    // 完了していなければ、少し待機してから再チェック
    // EndCheck の 完了コールバックで resolve, タイマー停止する
    obj.intervalID = setInterval(EndCheck, 1000, obj);
  });
}

async function exportLogs() {
  const functions = [];

  // なければエクスポート一覧を作成

  // 指定
  functions.push(exportLogsMain());
  await Promise.all(functions);
}

// スクリプトを実行
export { exportLogs };

/*
  パケットポリシー
  実際の環境に合わせて「【バケット名】,【リージョン】,【AWSアカウントID】」を修正してください。
  {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "logs.【リージョン】.amazonaws.com"
            },
            "Action": "s3:GetBucketAcl",
            "Resource": "arn:aws:s3:::【バケット名】",
            "Condition": {
                "StringEquals": {
                    "aws:SourceAccount": "【AWSアカウントID】"
                },
                "ArnLike": {
                    "aws:SourceArn": "arn:aws:logs:【リージョン】:【AWSアカウントID】:log-group:*"
                }
            }
        },
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "logs.【リージョン】.amazonaws.com"
            },
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::【バケット名】/*",
            "Condition": {
                "StringEquals": {
                    "s3:x-amz-acl": "bucket-owner-full-control",
                    "aws:SourceAccount": "【AWSアカウントID】"
                },
                "ArnLike": {
                    "aws:SourceArn": "arn:aws:logs:【リージョン】:【AWSアカウントID】:log-group:*"
                }
            }
        }
    ]
}

 */
