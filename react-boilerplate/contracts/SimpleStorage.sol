pragma solidity ^0.4.2;

contract SimpleStorage {
  uint storedData;

  event Changed(uint _value);

  function set(uint x) {
    storedData = x;
    Changed(x);
  }

  function get() constant returns (uint) {
    return storedData;
  }
}
