const ConvertLib = artifacts.require("ConvertLib");
const MetaCoin = artifacts.require("MetaCoin");
const MessageBox = artifacts.require("MessageBox");
const TxRelay = artifacts.require("TxRelay");
const MyToken = artifacts.require('./MyToken.sol');

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, MetaCoin);
  deployer.deploy(MetaCoin);

  const initialSupply = 50000e18
  deployer.deploy(MessageBox, "Hello from message box(exports)");
  deployer.deploy(TxRelay).then(function(){
    return deployer.deploy(MyToken, initialSupply, TxRelay.address );
  });
};
