var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var TxRelay = artifacts.require("./TxRelay.sol");
var MyToken = artifacts.require("./MyToken.sol");
var MessageBox = artifacts.require("./MessageBox.sol");

module.exports = function(deployer) {
  let log = deployer.deploy(SimpleStorage);
  console.log(log);
  // deployer.deploy(TxRelay);
  // deployer.deploy(MyToken);
  // deployer.deploy(MessageBox, "Hello from message box");
};
