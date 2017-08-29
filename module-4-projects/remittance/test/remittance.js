var Remittance = artifacts.require("./Remittance.sol");

contract('Remittance', function(accounts) {


  it("should send the eth to carol if both passwords are correct", function() {
    var remittance;
    var alice = accounts[0];
    var bob = accounts[1];
    var carol = accounts[2];

    // hello
    var bobPwd = "0xadb988ebfad21765f509632cc204d7cd28594591bf5c67d6297fd9138c4054a0";
    // world
    var carolPwd = "0x3752599af3f7af39e7d4fb5f59807e54c71b0c15f26149ab2837d51f1b8e72c9";
    // sha3(bobPwd, carolPwd)
    var alicePwd = "0xc9fa587cd94f701dfdbe325ba616eb3e9af1e60d1cb3894e5530f2cd9bc3b52d";

    var amount = web3.toWei(20);
    var expectedBalanceCarol = web3.eth.getBalance(carol).toNumber() + amount;
    console.log(alicePwd);

    return Remittance.deployed().then(function(instance) {
      remittance = instance;
      return remittance.setPassword(alicePwd, {from: alice});
    }).then(function(txInfo) {
      return remittance.deposit({
        from: alice,
        value: amount
      });
    }).then(function(txInfo) {
      assert(web3.eth.getBalance(remittance.address).toNumber(), amount);
      return remittance.withdraw(alice, bobPwd, carolPwd, {from: carol});
    }).then(function(txInfo) {
      console.log(txInfo.logs[0]);
      assert(web3.eth.getBalance(carol).toNumber(), expectedBalanceCarol);
    });
  });
});
