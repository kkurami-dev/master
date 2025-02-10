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

// ロググループをすべてリストアップする
async function listLogGroup( cb ){
  const getFuncs = async (param) => {
    const {func, nextToken, ti} = param;
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

// スクリプトを実行
export { queryLogs };
