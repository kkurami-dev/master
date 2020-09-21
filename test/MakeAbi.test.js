const ConvertLib = artifacts.require("../build/contracts/ConvertLib");
const MetaCoin = artifacts.require("../build/contracts/MetaCoin");

const MyToken = artifacts.require('../build/contracts/MyToken');
const TxRelay = require('../build/contracts/TxRelay');
const MessageBox = require('../build/contracts/MessageBox');

let fs;

function jsonWwrite (file, obj){
  let data = JSON.stringify(obj.abi);
  fs.writeFileSync(file, data)
}

before( async () => {
});

describe('make', () => {
  it('deploys contracts', () => {
    jsonWwrite("../../my-app/src/configs/MyTokenAbi.json", MyToken);
    jsonWwrite("../../my-app/src/configs/TxRelayAbi.json", TxRelay);
  });
});
