import { CloudWatchLogsClient, DescribeLogGroupsCommand, StartQueryCommand, GetQueryResultsCommand } from "@aws-sdk/client-cloudwatch-logs";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { fromUtf8, toUtf8 } from "@aws-sdk/util-utf8-node";

const cloudWatchLogsClient = new CloudWatchLogsClient({});
const s3Client = new S3Client({});
const BUCKET_NAME = process.env.BUCKET_NAME;
const QUERY_STRING = process.env.QUERY_STRING;
const LOGS_KEY = "cloudwatch-logs.json";
const QUERY_RESULTS_KEY = `query-results-${new Date().toISOString().split("T")[0]}.json`;
const MAX_LOG_GROUPS = 50;
const LAMBDA_TIMEOUT_MS = 14 * 60 * 1000; // 14 分

export const handler = async () => {
  if (!BUCKET_NAME || !QUERY_STRING) {
    throw new Error("BUCKET_NAME または QUERY_STRING が設定されていません");
  }

  let logGroups = await getLogGroups();
  let prevLogs = await getPreviousLogData();
  let filteredLogs = filterLogGroups(logGroups, prevLogs);
  await saveLogGroupsToS3(filteredLogs);
  
  let logGroupBatch = [];
  let startTime = Date.now();
  
  for (let logGroup of filteredLogs) {
    logGroupBatch.push(logGroup.logGroupName);
    if (logGroupBatch.length >= MAX_LOG_GROUPS) {
      await startQuery(logGroupBatch);
      logGroupBatch = [];
    }
    if (Date.now() - startTime > LAMBDA_TIMEOUT_MS - 10000) {
      console.log("Lambda timeout approaching, exiting...");
      return;
    }
  }

  if (logGroupBatch.length > 0) {
    await startQuery(logGroupBatch);
  }

  await fetchQueryResultsAndSave();
};

async function getLogGroups(nextToken = null) {
  let logGroups = [];
  let params = { nextToken };
  
  while (true) {
    const command = new DescribeLogGroupsCommand(params);
    const response = await cloudWatchLogsClient.send(command);
    logGroups.push(...response.logGroups);
    
    if (!response.nextToken) break;
    params.nextToken = response.nextToken;
  }
  
  return logGroups;
}

async function getPreviousLogData() {
  try {
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: LOGS_KEY });
    const { Body } = await s3Client.send(command);
    return JSON.parse(toUtf8(await Body.transformToByteArray()));
  } catch (error) {
    if (error.name === "NoSuchKey") return [];
    throw error;
  }
}

function filterLogGroups(currentLogs, previousLogs) {
  let prevLogMap = new Map(previousLogs.map(log => [log.logGroupName, log.logSize]));
  return currentLogs.filter(log => {
    let prevSize = prevLogMap.get(log.logGroupName) || 0;
    return log.storedBytes > 0 && log.storedBytes !== prevSize;
  });
}

async function saveLogGroupsToS3(logGroups) {
  if (logGroups.length === 0) return;
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: LOGS_KEY,
    Body: fromUtf8(JSON.stringify(logGroups)),
    ContentType: "application/json"
  });
  await s3Client.send(command);
}

async function startQuery(logGroupNames) {
  const command = new StartQueryCommand({
    logGroupNames,
    startTime: Math.floor(Date.now() / 1000) - 86400, // 過去24時間
    endTime: Math.floor(Date.now() / 1000),
    queryString: QUERY_STRING
  });
  const response = await cloudWatchLogsClient.send(command);
  console.log(`Started query for log groups: ${logGroupNames}, Query ID: ${response.queryId}`);
}

async function fetchQueryResultsAndSave() {
  try {
    const command = new GetQueryResultsCommand({ queryId: "your-query-id" });
    const response = await cloudWatchLogsClient.send(command);
    if (response.status === "Complete") {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: QUERY_RESULTS_KEY,
        Body: fromUtf8(JSON.stringify(response.results)),
        ContentType: "application/json"
      });
      await s3Client.send(command);
    }
  } catch (error) {
    console.error("Error fetching query results:", error);
  }
}
