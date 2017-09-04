pragma solidity ^0.4.6;

contract Campaign {

    address public owner;
    uint public deadline;
    uint public goal;
    uint public fundsRaised;
    bool public running;

    struct FunderStruct {
        uint amount;
    }

    mapping(address => FunderStruct) public funderStructs;

    event LogContribution(address sender, uint amount);
    event LogRefundSent(address funder, uint amount);
    event LogWithdraw(address beneficiary, uint amount);

    modifier onlyIfRunning() {
        require(running);
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function Campaign(uint duration, uint _goal) {
        owner = msg.sender;
        deadline = block.number + duration;
        goal = _goal;
        running = true;
    }

    function isSuccess() public constant returns (bool isIndeed) {
        return(fundsRaised >= goal);
    }

    function hasFailed() public constant returns (bool hasIndeed) {
        return(fundsRaised < goal && block.number > deadline);
    }

    function runSwitch(bool onOff) public onlyOwner returns (bool success) {
        running = onOff;
        return true;
    }

    function contribute() public onlyIfRunning payable returns (bool success) {
        require(msg.value > 0);
        require(!isSuccess());
        require(!hasFailed());

        fundsRaised += msg.value;
        funderStructs[msg.sender].amount += msg.value;

        LogContribution(msg.sender, msg.value);
        return true;
    }

    function withdrawFunds() public onlyIfRunning onlyOwner returns (bool success) {
        require(isSuccess());

        uint amount = this.balance;
        owner.transfer(amount);

        LogWithdraw(msg.sender, amount);
        return true;
    }

    function requestRefund() public onlyIfRunning returns (bool success) {
        require(hasFailed());

        uint amountOwed = funderStructs[msg.sender].amount;
        require(amountOwed > 0);

        funderStructs[msg.sender].amount = 0;
        msg.sender.transfer(amountOwed);
        LogRefundSent(msg.sender, amountOwed);
        return true;
    }
}
