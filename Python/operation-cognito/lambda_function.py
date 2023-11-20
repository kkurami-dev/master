import json
import boto3
import logging
import botocore
import os

REGION = 'ap-northeast-1'
# ユーザプールID
USERPOOLID = os.environ['USERPOOLID']
# クライアントID
CLIENTID = os.environ['CLIENTID']

cognito_idp = boto3.client('cognito-idp')
logger = logging.getLogger()
logger.setLevel(logging.INFO)

################################################################################
# https://qiita.com/ttkiida/items/fdd93e166f2d36e581e4
# Confirmed状態のCognitoユーザーをBoto 3で即作成する
def user_new(event, context):
    # アカウント情報
    username = event['userId']
    userpass = event['userPassword']
    email = event['email']

    # ユーザーを作成する。
    cognito_idp.admin_create_user(
        UserPoolId=USERPOOLID,
        Username=username,
        TemporaryPassword=userpass,
        UserAttributes=[{'Name': 'email', 'Value': email}],
        MessageAction='SUPPRESS',
    )
    
    # ログインを試みる。（パスワードの変更を要求される。）
    response = cognito_idp.admin_initiate_auth(
        UserPoolId=USERPOOLID,
        ClientId=CLIENTID,
        AuthFlow='ADMIN_NO_SRP_AUTH',
        AuthParameters={'USERNAME': username, 'PASSWORD': userpass},
    )
    session = response['Session']
    
    # パスワードを変更する。
    response = cognito_idp.admin_respond_to_auth_challenge(
        UserPoolId=USERPOOLID,
        ClientId=CLIENTID,
        ChallengeName='NEW_PASSWORD_REQUIRED',
        ChallengeResponses={'USERNAME': username, 'NEW_PASSWORD': userpass},
        Session=session,
    )

    # aws cognito-idp admin-add-user-to-group --user-pool-id USER_POOL_ID --username USERNAME --group-name GROUP_NAME
    # グループにユーザを追加する
    response = cognito_idp.admin_add_user_to_group(
        UserPoolId=USERPOOLID,
        Username=username,
        GroupName='operator',
    )

def user_del(event, context):
    # アカウント情報
    username = event['userId']

    # ユーザーを作成する。
    cognito_idp.admin_delete_user(
        UserPoolId=USERPOOLID,
        Username=username,
    )

################################################################################
# https://qiita.com/cloud-solution/items/3a770fb763efcf92a4a9
# AWS LambdaでAmazon Cognitoユーザの作成とログインを行う
def login(event, context):
    # アカウント情報
    username = event['userId']
    userpass = event['userPassword']

    try:
        response = cognito_idp.admin_initiate_auth(
            UserPoolId = USERPOOLID,
            ClientId = CLIENTID,
            AuthFlow = "ADMIN_USER_PASSWORD_AUTH",
            AuthParameters = {
                "USERNAME": username,
                "PASSWORD": userpass,
            }
        )

        #logger.info(response["AuthenticationResult"]["AccessToken"])
        #logger.info(response["AuthenticationResult"]["RefreshToken"])
        #logger.info(response["AuthenticationResult"]["IdToken"])
        logger.info(response)

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps(response)
        }

    except botocore.exceptions.ClientError as error:
        if error.response['Error']['Code'] == 'UserNotFoundException':
            logger.info('user not found.')
            return {
                'statusCode': 200,
                'body': json.dumps('user not found.')
            }
        else:
            raise error

################################################################################
# https://qiita.com/jp_ibis/items/4fffb3c924504f0ce6fb
# PythonでAWS Cognito認証
def cognito_auth(user, passwd):
    # 認証開始
    try:
        aws_result = cognito_idp.admin_initiate_auth(
            UserPoolId = USERPOOLID,
            ClientId = CLIENTID,
            AuthFlow = "ADMIN_NO_SRP_AUTH",
            AuthParameters = {
                "USERNAME": user,
                "PASSWORD": passwd,
            }
        )

        # 認証完了
        return aws_result

    except :
        # 認証失敗
        return None

# https://qiita.com/yakult/items/2cbb2f57c97487b6268b
# AWS CognitoをPythonから扱う
def cognito_auth(username, email, gender, birthday, nickname):
    # 認証開始
    try:
        # ユーザー作成
        aws_result = cognito_idp.admin_create_user(
            # cognito設定時のユーザープールID
            UserPoolId='***',
            Username=username,
            UserAttributes=[
                {
                    'Name': 'email',
                    'Value': email
                },
                {
                    'Name': 'gender',
                    'Value': gender
                },
                {
                    'Name': 'birthdate',
                    'Value': birthdate
                },
                {
                    'Name': 'nickname',
                    'Value': nickname
                },
            ],
            # Mailに初期パスワードを送信する
            DesiredDeliveryMediums=['EMAIL']
        )

        # 認証完了
        print(aws_result)

    except:
        # 認証失敗
        print('Error')

#cognito_auth('username', 'email', 'gender', 'birthdate', 'nickname')

def lambda_handler(event, context):
    logger.info(event)

    if 'func' in event and event['func'] == "login":
    	return login(event, context)
    if 'func' in event and event['func'] == 'user_new':
        return user_new(event, context)
    if 'func' in event and event['func'] == 'user_del':
        return user_del(event, context)
    
    # TODO implement
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
