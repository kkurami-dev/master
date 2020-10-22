// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2;

contract SimpleStorage {
  uint storedData;

  mapping (address => string[]) ownsContents;

  function set(uint x) public {
    storedData = x;
  }

  function get() public view returns (uint) {
    return storedData;
  }

  function setSS(address own, string memory con ) public {
      ownsContents[own].push(con);
  }
}
