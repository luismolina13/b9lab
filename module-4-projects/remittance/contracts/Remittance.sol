pragma solidity ^0.4.13;

contract Remittance {
  mapping (address => bytes32) passwords;
  mapping (address => bool) hasPassword;
	mapping (address => mapping(bytes32 => bool)) usedPasswords;
	mapping (address => uint) public balances;

	event PasswordSet(address from, bytes32 password);
	event Deposit(address from, uint oldBalance, uint newBalance);
	event Withdraw(address from, address to, uint amount);

	function setPassword(bytes32 password) {
	    require(!usedPasswords[msg.sender][password]);

	    passwords[msg.sender] = password;
	    hasPassword[msg.sender] = true;
	    PasswordSet(msg.sender, password);
	}

	function deposit() payable {
		require(msg.value > 0);
		require(hasPassword[msg.sender]);

		uint oldBalance = balances[msg.sender];
		uint newBalance = oldBalance + msg.value;

		balances[msg.sender] = newBalance;
		Deposit(msg.sender, oldBalance, newBalance);
	}

	function withdraw(address from, bytes32 pwdOne, bytes32 pwdTwo) {
	    bytes32 password = sha3(pwdOne, pwdTwo);
	    uint amount = balances[from];

	    require(amount > 0);
	    require(hasPassword[from]);
	    assert(password == passwords[from]);

	    msg.sender.transfer(amount);

	    // Reset the values for the account we withdraw from
	    balances[from] = 0;
	    usedPasswords[from][password] = true;
	    hasPassword[from] = false;

	    Withdraw(from, msg.sender, amount);
	}
}
