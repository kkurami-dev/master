const AWS = require('aws-sdk');
//const scheduler = new AWS.Scheduler();

let ACCOUNTID = '';

async function test(context){
  const params = {
    Name: "DEMO_EVENT",
    ScheduleExpression: 'at(2022-12-18T09:00:00)',
    FlexibleTimeWindow:{
      Mode:'OFF'
    },
    Target:{
      Arn: 'arn:aws:lambda:ap-northeast-1:176264229023:function:test0003',
      //Arn:`arn:aws:scheduler:ap-northeast-1:${ACCOUNTID}:schedule/default/test1`,
      RoleArn:`arn:aws:iam::${ACCOUNTID}:role/service-role/Amazon_EventBridge_Scheduler_LAMBDA_1571eb1f29`,
      Input: '{"AAA":"BBB"}',
    },
    //ScheduleExpressionTimezone:'',

    /*
      {
      "Version": "2012-10-17",
      "Statement": [
      {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:ap-northeast-1:${ACCOUNTID}:function:*"
      }]}
    */
    ScheduleExpression: "rate(5 minutes)",
    //State: "ENABLED",
    ClientToken: context.aws_request_id,
  };
  //return await scheduler.createSchedule(params).promise();
  //return await EbPutRule( params );
}

exports.handler = async (event, context, callback) => {
  ACCOUNTID = context.invokedFunctionArn.split(':')[4];
  //await test( context );
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
