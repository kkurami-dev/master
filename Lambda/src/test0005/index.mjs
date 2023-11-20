//const execSync = require('child_process').execSync;
import {execSync} from 'child_process';

var currentEnvironment;
if (typeof window !== 'undefined') {
    currentEnvironment = 'browser';
//} else if (require && require('nw.gui')) {
//    currentEnvironment = 'node-webkit';
} else {
   currentEnvironment = 'node';
}
console.log("process", currentEnvironment);
console.log(process.env);

const REQUESTHANDLER = {
  // connectionTimeout: 300,
  // socketTimeout: 100,
  connectionTimeout: 30,
  socketTimeout: 20,
};

export const handler = async(event) => {
    console.log("event %j", event);
    
    const { NodeHttpHandler } = await import('@aws-sdk/node-http-handler');
    const requestHandler = new NodeHttpHandler(REQUESTHANDLER);
    
    const unameResult = execSync('uname -a');
    console.log(unameResult.toString());

    const catResult = execSync('cat /etc/system-release');
    console.log(catResult.toString());
    
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
