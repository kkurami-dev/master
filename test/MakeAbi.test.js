const cdir = '../client/src/contracts';

//const ConvertLib = artifacts.require(cdir + "/ConvertLib");
//const MetaCoin = artifacts.require(cdir + "/MetaCoin");

const MyToken = artifacts.require(cdir + '/MyToken');
const TxRelay = require(cdir + '/TxRelay');
const MessageBox = require(cdir + '/MessageBox');
const SimpleStorage = require(cdir + '/SimpleStorage');
const fs = require("fs");

function jsonWwrite (file, obj){
  let data = JSON.stringify(obj.abi,  " ", 2);
  //console.log(file);
  //console.log(data);
  fs.writeFileSync("./client/src/configs/"+ file, data);
}

before( async () => {
});

describe('make', () => {
  return;

  it('deploys contracts', () => {
    console.log("process.config", process.config);
    jsonWwrite("SimpleStorageAbi.json", SimpleStorage);
    
    jsonWwrite("MyTokenAbi.json", MyToken);
    jsonWwrite("TxRelayAbi.json", TxRelay);
    jsonWwrite("SimpleStorageAbi.json", SimpleStorage);
    jsonWwrite("MessageBoxAbi.json", MessageBox);
  });
});
