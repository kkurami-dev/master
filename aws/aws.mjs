import React, { useState } from 'react';

import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
export const client = new STSClient({ region: REGION });
import { STS } from 'aws-sdk';

const awsid_root = process.env.REACT_APP_AWS_ROOT;
const awsid_jump = process.env.REACT_APP_AWS_JUMP;

// https://docs.aws.amazon.com/ja_jp/sdk-for-javascript/v3/developer-guide/javascript_sts_code_examples.html
// 
const SwitchRoleWithMfa = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState('');
  const [assumedRoleCredentials, setAssumedRoleCredentials] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sts = new STS();

    // 1. US, PW
    //    -> 認証
    // 2. MF
    // 

    try {
      // ユーザー名とパスワードを使って一時的な認証情報を取得
      const loginData = await sts.assumeRoleWithWebIdentity({
        RoleArn: `arn:aws:iam::${awsid_root}:role/${username}`,
        RoleSessionName: 'session1',
        //WebIdentityToken: 'YOUR_WEB_IDENTITY_TOKEN',
        DurationSeconds: 900,
      }).promise();

      console.log('Login data:', loginData);

      // MFAコードと一時的な認証情報を使って、スイッチロール
      const mfaData = await sts.assumeRole({
        RoleArn: 'YOUR_SWITCH_ROLE_ARN',
        RoleSessionName: 'session2',
        DurationSeconds: 3600, // optional, how long the temporary credentials should be valid for
        // SerialNumber: 'YOUR_MFA_DEVICE_SERIAL_NUMBER',
        SerialNumber: 'arn:aws:iam::123456789012:mfa/user', // MFAデバイスのARN
        TokenCode: mfaCode,
        ...loginData.Credentials, // 一時的な認証情報を渡す
      }).promise();

      console.log('MFA data:', mfaData);

      // スイッチロールした認証情報をセット
      setAssumedRoleCredentials({
        accessKeyId: mfaData.Credentials.AccessKeyId,
        secretAccessKey: mfaData.Credentials.SecretAccessKey,
        sessionToken: mfaData.Credentials.SessionToken,
      });

      // ここで、必要に応じて取得したクレデンシャルを使ってAWSサービスにアクセスする

    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="ユーザー名" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="text" placeholder="MFAコード" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} />
        <button type="submit">ログイン</button>
      </form>
      {assumedRoleCredentials && (
        <div>
          <h3>スイッチロール成功</h3>
          <p>Access Key ID: {assumedRoleCredentials.accessKeyId}</p>
          <p>Secret Access Key: {assumedRoleCredentials.secretAccessKey}</p>
          <p>Session Token: {assumedRoleCredentials.sessionToken}</p>
        </div>
      )}
      {error && <div>{error}</div>}
    </div>
  );
};

export default SwitchRoleWithMfa;
