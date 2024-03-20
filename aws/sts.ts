import * as AWS from "aws-sdk";
import { createInterface } from "readline";
import * as fs from "fs";

interface RoleProfile {
  mfaSerial: string;
  roleArn: string;
}

// Get Credentials
export const getCredentials = async (
  profileName: string
): Promise<AWS.Credentials | undefined> => {
  const roleProfile = await getRoleProfile(profileName);
  if (!roleProfile) return undefined;

  const credentials = await assumeRole(roleProfile);
  if (!credentials) return undefined;

  return new AWS.Credentials({
    accessKeyId: credentials.AccessKeyId,
    secretAccessKey: credentials.SecretAccessKey,
    sessionToken: credentials.SessionToken,
  });
};

// Get IAM Role profile
export const getRoleProfile = async (
  profileName: string
): Promise<RoleProfile | undefined> => {
  return new Promise((resolve, reject) => {
    // Read ~/.aws/config
    const awsConfig = fs.readFileSync(
      `${process.env.HOME}/.aws/config`,
      "utf8"
    );
    const awsConfigLines = awsConfig.toString().split("\n");

    const profileNameIndex = awsConfigLines.indexOf(`[profile ${profileName}]`);

    if (profileNameIndex == -1) {
      reject(
        `There were no matching profiles in "${process.env.HOME}/.aws/config".`
      );
    }

    // Get mfa serial of the profile
    const mfaSerialLine = awsConfigLines.filter(
      (line: string, index: number) =>
        line.indexOf("mfa_serial = ") === 0 && index > profileNameIndex
    )[0];
    const mfaSerialIndex = mfaSerialLine.indexOf(" = ") + 3;
    const mfaSerial = mfaSerialLine.slice(mfaSerialIndex);

    // Get IAM Role Arn of the profile
    const roleArnlLine = awsConfigLines.filter(
      (line: string, index: number) =>
        line.indexOf("role_arn = ") === 0 && index > profileNameIndex
    )[0];
    const roleArnIndex = roleArnlLine.indexOf(" = ") + 3;
    const roleArn = roleArnlLine.slice(roleArnIndex);

    resolve({
      mfaSerial: mfaSerial,
      roleArn: roleArn,
    });
  });
};

// Assume Role
export const assumeRole = async (
  roleProfile: RoleProfile
): Promise<AWS.STS.Credentials | undefined> => {
  const sts = new AWS.STS();

  // Input MFA Token
  const mfaToken = await readInput(`MFA token for ${roleProfile.mfaSerial} > `);

  return new Promise((resolve, reject) => {
    const params: AWS.STS.AssumeRoleRequest = {
      RoleArn: roleProfile.roleArn,
      SerialNumber: roleProfile.mfaSerial,
      TokenCode: <string>mfaToken,
      RoleSessionName: new Date().getTime().toString(),
      DurationSeconds: 900,
    };
    sts.assumeRole(params, (error, data) => {
      if (error) reject(error);
      console.dir(data);
      resolve(data?.Credentials);
    });
  });
};

// Read Input
export const readInput = async (
  questionText: string
): Promise<string | undefined> => {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    readline.question(questionText, (answerText) => {
      resolve(answerText);
      readline.close();
    });
  });
};
