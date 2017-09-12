pragma solidity ^0.4.0;

contract Admin {

  mapping(address => bool) public admins;
  address public owner;

    event LogAdminAdded(address);
    event LogAdminRemoved(address);

    modifier isAdmin() {
        require(admins[msg.sender] || msg.sender == owner);
        _;
    }

    modifier isOwner() {
        require(msg.sender == owner);
        _;
    }

    function addAdmin(address newAdmin) public isOwner {
        admins[newAdmin] = true;
        LogAdminAdded(newAdmin);
    }

    function removeAdmin(address admin) public isOwner {
        admins[admin] = false;
        LogAdminRemoved(admin);
    }


}
