import {jest} from '@jest/globals';

jest.useFakeTimers();
import.meta.jest.useFakeTimers();

import {
  GetUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  TransactWriteItemsCommand,
  BatchGetItemCommand,
  BatchWriteItemCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  S3Client,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  UploadPartCommand,
  PutPublicAccessBlockCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import { mockClient } from "aws-sdk-client-mock";

const dynamoDB = new DynamoDBClient({});
const dynamoDBMock = mockClient(dynamoDB);
const userPoolMock = mockClient(CognitoIdentityProviderClient);
const dynamoDBdocMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

function MockReset(){
  userPoolMock.reset();
  userPoolMock.onAnyCommand().resolves({});
  dynamoDBdocMock.reset();
  dynamoDBdocMock.onAnyCommand().resolves({});
  s3Mock.reset();
  s3Mock.onAnyCommand().resolves({});
}

export {
  dynamoDBMock,
  dynamoDBdocMock,
  s3Mock,

  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,

  MockReset
};

