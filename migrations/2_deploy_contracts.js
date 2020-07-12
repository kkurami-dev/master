const ConvertLib = artifacts.require("ConvertLib");
const MetaCoin = artifacts.require("MetaCoin");
const MessageBox = artifacts.require("MessageBox");
const TxRelay = artifacts.require("TxRelay");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, MetaCoin);
  deployer.deploy(MetaCoin);

  deployer.deploy(MessageBox, "Hello from message box(exports)");
  deployer.deploy(TxRelay);
};
