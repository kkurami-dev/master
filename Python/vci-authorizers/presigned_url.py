import os
import json
import boto3
import datetime

#from boto3 import Session
#from botocore.session import get_session
#from botocore.session import ClientError, ParamValidationError
from boto3.s3.transfer import S3Transfer
from boto3.s3.transfer import TransferConfig

print('transfer', boto3.s3.transfer)

s3r = boto3.resource('s3')
s3c = boto3.client('s3')
cloudwatch = boto3.client('cloudwatch')

# s3 にファイルがあるか確認する
def check_data(bucket_name, date):
    prefix = date
    response = s3c.list_objects(
        Bucket=bucket_name,
        Prefix=prefix
    )
    assumed_keys = [f'{date}']
    try:
        keys = [content['Key'] for content in response['Contents']]
        status = set(assumed_keys).issubset(keys)
    except KeyError:
        status = False
    return status

def put_s3(data :str, bucket :str, key :str) -> bool:
    """データフレームをS3に保存する関数
    Args:
        dataframe: 保存するデータフレーム
        bucket: s3の保存するバケット名
        key: s3の保存するキー名
    Returns:
        bool: 保存実施の成否
    """
    try:
        #session = get_session()
        #autorefresh_session = Session(botocore_session=session)
        #s3_client = autorefresh_session.client('s3')
 
        config = TransferConfig(
            multipart_threshold = 8 * 1024 * 1024,
            max_concurrency = 10,
            multipart_chunksize = 8388608,
            num_download_attempts = 10,
            max_io_queue = 100
        )
        #transfer = S3Transfer(client=s3_client, config=config)
        #transfer = S3Transfer(client=s3c, config=config)
        transfer = S3Transfer(s3c)
        transfer.upload_file(
            filename=data,
            bucket=bucket,
            key=key
        )
        print('transfer OK')
        return True
    except KeyError:
        return False
    # except ClientEror as e:
    #     return False

def get_sign_url(bucket_name:str, infile :str, outfile :str, time):
    # s3 にファイルを保存
    ix = check_data(bucket_name, outfile)
    if ix == False:
        print('s3put file:', infile, outfile)
        # put_object メソッドでアップロードできるオブジェクトサイズは5GBという制限がある
        #s3c.upload_file(infile, outfile)
        #put_s3(bucket_name, infile, outfile)
        transfer = S3Transfer(s3c)
        transfer.upload_file(
            filename=infile,
            bucket=bucket_name,
            key=outfile
        )

    # s3 にあるファイルの署名付きURLを作成
    presigned_url = s3c.generate_presigned_url(
        'get_object',
        Params={'Bucket':bucket_name, 'Key' : outfile},
        ExpiresIn=time,        # ダウンロード可能時間：10分
        )
    print ( 'presigned_url:', presigned_url );
    return presigned_url;

def lambda_handler2(event, context):
    bucket_name = "kktest-rest";
    input_file = "/tmp/test.txt";
    output_file = "tmp/test.txt";
    
    datalist = [
        'こんにちは\nお元気ですか？\nそれではまた\n','こんにちは\nお元気ですか？\nそれではまた\nこんにちは\nお元気ですか？\nそれではまた\n','こんにちは\nお元気ですか？\nそれではまた\n',
        'こんにちは\nお元気ですか？\nそれではまた\n','こんにちは\nお元気ですか？\nそれではまた\nこんにちは\nお元気ですか？\nそれではまた\n','こんにちは\nお元気ですか？\nそれではまた\n',
        'こんにちは\nお元気ですか？\nそれではまた\n','こんにちは\nお元気ですか？\nそれではまた\nこんにちは\nお元気ですか？\nそれではまた\n','こんにちは\nお元気ですか？\nそれではまた\n',
        'こんにちは\nお元気ですか？\nそれではまた\n','こんにちは\nお元気ですか？\nそれではまた\nこんにちは\nお元気ですか？\nそれではまた\n','こんにちは\nお元気ですか？\nそれではまた\n',
    ];

    f = open(input_file, 'w', encoding='UTF-8');
    for i in range(100000):
        f.writelines(datalist);
    f.close();
    
    print('file_size:', os.path.getsize(input_file),
          ', check_data:', check_data(bucket_name, output_file));
    get_sign_url(bucket_name, input_file, output_file, 10);

   # TODO implement
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda! user')
    }

def lambda_handler(event, context):
    id = event['id']

    #PutMetricData
    PutMetricData = cloudwatch.put_metric_data(
        Namespace='VPN',
        MetricData=[
            {
                'MetricName': 'vpnConnection',
                'Dimensions': [
                    {
                        'Name': 'id',
                        'Value': id
                    },
                ],
                'Timestamp': datetime.datetime.utcnow(),
                'Value': 1,
                'Unit': "Count"
            },
        ]
    )

    PutMetricData
