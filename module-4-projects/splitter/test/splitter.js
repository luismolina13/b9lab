var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {

  it("should split the ether between two accounts", function() {
    var splitter;
    var alice = accounts[0];
    var bob = accounts[1];
    var carol = accounts[2];

    var amount = web3.toWei(10);
    var expectedBalanceBob = amount / 2;

    return Splitter.deployed().then(function(instance) {
      splitter = instance;
      return splitter.registerSplit(bob, carol, {
        from: alice,
        value: amount
      });
    }).then(function(txInfo) {
      return splitter.balances(bob, {from: alice});
    }).then(function(balance) {
      assert.equal(balance.toNumber(), amount / 2);
      return splitter.withdraw({from: bob});
    }).then(function(txInfo) {
      return splitter.balances(bob, {from: alice});
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 0);
    });
  });
});
