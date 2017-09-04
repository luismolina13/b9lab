pragma solidity ^0.4.6;

contract Owned {
    address public owner;

    event LogNewOwner(address oldOwner, address newOwner);

    function Owned() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function changeOwner(address newOwner) onlyOwner returns (bool success) {
        require(newOwner != 0);
        LogNewOwner(owner, newOwner);
        owner = newOwner;
        return true;
    }
}
