pragma solidity ^0.4.6;

import "./Owned.sol";

contract Stoppable is Owned {
    bool public running;

    event LogRunSwitch(bool switchSetting);

    function Stoppable() {
        running = true;
    }

    modifier onlyIfRunning() {
        require(running);
        _;
    }

    function runSwitch(bool onOff) public onlyOwner returns (bool success) {
        LogRunSwitch(onOff);
        running = onOff;
        return true;
    }
}
