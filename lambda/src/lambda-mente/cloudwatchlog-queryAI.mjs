import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { CloudWatchLogsClient, DescribeLogGroupsCommand, StartQueryCommand, GetQueryResultsCommand } from "@aws-sdk/client-cloudwatch-logs";
import { fromUtf8, toUtf8 } from "@aws-sdk/util-utf8-node";

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const logsClient = new CloudWatchLogsClient({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.BUCKET_NAME;
const QUERY_STRING = process.env.QUERY_STRING;
const MAX_LOG_GROUPS = 50;

async function listLogGroups() {
  let logGroups = [];
  let nextToken;

  do {
    const response = await logsClient.send(new DescribeLogGroupsCommand({ nextToken }));
    logGroups.push(...response.logGroups);
    nextToken = response.nextToken;
  } while (nextToken);

  return logGroups;
}

async function getS3LogData() {
  try {
    const data = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: "log_group_sizes.json" }));
    return JSON.parse(toUtf8(await data.Body.transformToString()));
  } catch (error) {
    return {};
  }
}

async function saveS3LogData(logData) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: "log_group_sizes.json",
    Body: fromUtf8(JSON.stringify(logData, null, 2)),
    ContentType: "application/json"
  });
  await s3Client.send(command);
}

async function startQuery(logGroups) {
  const command = new StartQueryCommand({
    logGroupNames: logGroups,
    startTime: Math.floor(Date.now() / 1000) - 86400,
    endTime: Math.floor(Date.now() / 1000),
    queryString: QUERY_STRING,
  });
  const response = await logsClient.send(command);
  return response.queryId;
}

async function getQueryResults(queryId) {
  let response;
  do {
    response = await logsClient.send(new GetQueryResultsCommand({ queryId }));
    if (response.status === "Complete") return response.results;
    await new Promise(res => setTimeout(res, 5000));
  } while (response.status !== "Complete");
}

export async function handler() {
  const logGroups = await listLogGroups();
  const savedLogData = await getS3LogData();
  const newLogData = {};
  let batch = [];
  let queryIds = [];

  for (const group of logGroups) {
    const { logGroupName, storedBytes } = group;
    if (storedBytes === 0) continue;
    if (savedLogData[logGroupName] === storedBytes) continue;
    
    newLogData[logGroupName] = storedBytes;
    batch.push(logGroupName);
    
    if (batch.length >= MAX_LOG_GROUPS) {
      queryIds.push(await startQuery(batch));
      batch = [];
    }
  }

  if (batch.length > 0) queryIds.push(await startQuery(batch));
  await saveS3LogData(newLogData);
  
  let results = [];
  for (const queryId of queryIds) {
    results.push(await getQueryResults(queryId));
  }
  
  if (results.length > 0) {
    const date = new Date().toISOString().split("T")[0];
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `query_results_${date}.json`,
      Body: fromUtf8(JSON.stringify(results, null, 2)),
      ContentType: "application/json"
    });
    await s3Client.send(command);
  }
}
