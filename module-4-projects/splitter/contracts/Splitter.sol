pragma solidity ^0.4.6;

contract Splitter {

  mapping (address => uint) public balances;

  event SplitRegistered(address from, address one, address two, uint amountOne, uint amountTwo);
  event EtherSplit(address from, uint amount);

  function registerSplit(address beneficiaryOne, address beneficiaryTwo) payable {
    require(msg.value > 0);

    uint amountOne = msg.value / 2;
    uint amountTwo = amountOne;
    uint even = msg.value % 2;
    if (even == 1) {
      amountTwo += 1;
    }

    assert(amountOne + amountTwo == msg.value);

    balances[beneficiaryOne] += amountOne;
    balances[beneficiaryTwo] += amountTwo;

    SplitRegistered(msg.sender, beneficiaryOne, beneficiaryTwo, amountOne, amountTwo);
  }

  function withdraw() {
    require(balances[msg.sender] > 0);

    uint amount = balances[msg.sender];
    msg.sender.transfer(amount);
    balances[msg.sender] = 0;

    EtherSplit(msg.sender, amount);
  }
}
