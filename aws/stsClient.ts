import {
  STSClient,
  AssumeRoleCommand,
  AssumeRoleCommandInput,
  AssumeRoleCommandOutput,
} from "@aws-sdk/client-sts";
import { createInterface } from "readline";
import * as fs from "fs";

interface RoleProfile {
  mfaSerial: string;
  roleArn: string;
}

// STS Client
export const stsClient = async (
  profileName: string,
  regionName: string
): Promise<STSClient> => {
  const roleProfile = await getRoleProfile(profileName);

  const credentials = await assumeRole(roleProfile, regionName);
  return new Promise((resolve, reject) => {
    if (credentials) {
      resolve(
        new STSClient({
          credentials: {
            accessKeyId: <string>credentials.AccessKeyId,
            secretAccessKey: <string>credentials.SecretAccessKey,
            sessionToken: credentials.SessionToken,
          },
        })
      );
    } else {
      reject("Failed assume role.");
    }
  });
};

// Get IAM Role profile
export const getRoleProfile = async (
  profileName: string
): Promise<RoleProfile> => {
  return new Promise((resolve, reject) => {
    // Read ~/.aws/config
    const awsConfig = <string>(() => {
      try {
        return fs.readFileSync(`${process.env["HOME"]}/.aws/config`, "utf8");
      } catch (error) {
        reject(error);
        return;
      }
    })();

    // Check if there is a matching IAM Role Profile
    const awsConfigLines = awsConfig.toString().split("\n");
    const profileIndex = awsConfigLines.indexOf(`[profile ${profileName}]`);
    if (profileIndex == -1) {
      reject(
        `${profileName} does not exist in "${process.env["HOME"]}/.aws/config".`
      );
    }

    // Get the index at the end of the specified IAM Role Profile
    const profileEndIndex = awsConfigLines.findIndex(
      (line: string, index: number) =>
        line === "" && index > profileIndex && index < profileIndex + 6
    );
    if (profileEndIndex == -1) {
      reject(
        `Add a new line at the end of ${profileName} in "${process.env["HOME"]}/.aws/config".`
      );
    }

    // Get MFA serial of the profile
    const mfaSerial = <string>(() => {
      const mfaSerialLine = awsConfigLines.find(
        (line: string, index: number) =>
          line.indexOf("mfa_serial") === 0 &&
                                       index > profileIndex &&
                                       index < profileEndIndex
      );
      if (!mfaSerialLine) {
        reject(`"mfa_serial" does not exist in ${profileName}.`);
        return;
      }
      const mfaSerialIndex = mfaSerialLine.indexOf("=") + 1;
      return mfaSerialLine.slice(mfaSerialIndex).trim();
    })();

    // Get IAM Role Arn of the profile
    const roleArn = <string>(() => {
      const roleArnlLine = awsConfigLines.find(
        (line: string, index: number) =>
          line.indexOf("role_arn") === 0 &&
                                       index > profileIndex &&
                                       index < profileEndIndex
      );
      if (!roleArnlLine) {
        reject(`"role_arn" does not exist in ${profileName}.`);
        return;
      }
      const roleArnIndex = roleArnlLine.indexOf("=") + 1;
      return roleArnlLine.slice(roleArnIndex).trim();
    })();

    resolve({
      mfaSerial: mfaSerial,
      roleArn: roleArn,
    });
  });
};

// Assume Role
export const assumeRole = async (
  roleProfile: RoleProfile,
  regionName: string
): Promise<AssumeRoleCommandOutput["Credentials"]> => {
  const stsClient = new STSClient({ region: regionName });

  // Read the MFA Token in standard input
  const mfaToken = await readStandardInput(
    `MFA token for ${roleProfile.mfaSerial} > `
  );

  const params: AssumeRoleCommandInput = {
    RoleArn: roleProfile.roleArn,
    SerialNumber: roleProfile.mfaSerial,
    TokenCode: <string>mfaToken,
    RoleSessionName: new Date().getTime().toString(),
    DurationSeconds: 900,
  };
  return new Promise((resolve, reject) => {
    stsClient.send(new AssumeRoleCommand(params)).then(
      (data) => {
        resolve(data.Credentials);
      },
      (error) => {
        reject(error);
      }
    );
  });
};

// Read standard input
export const readStandardInput = async (
  questionText: string
): Promise<string> => {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    readline.question(questionText, (answerText) => {
      if (answerText) {
        resolve(answerText);
      } else {
        reject("Failed read standard input.");
      }
      readline.close();
    });
  });
};
