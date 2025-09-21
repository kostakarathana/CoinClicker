// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Simple pool: every 10 minutes a new interval starts and runs for up to 2 minutes.
// Each click updates lastClicker and lastClickTime. A payout can be triggered when
// the interval is over — contract allows anyone to call claimWinner which pays
// the pool balance to the lastClicker if the interval has ended. For PoC only.

contract LastClickPool {
    address public owner;
    address public lastClicker;
    uint256 public lastClickTime;
    uint256 public roundStart; // Unix timestamp of current 10-min window start
    uint256 public roundEnd; // timestamp when current active window may end (start + up to 2min)
    uint256 public roundIndex;

    event Click(address indexed who, uint256 time, uint256 round);
    event Payout(address indexed winner, uint256 amount, uint256 round);

    constructor() payable {
        owner = msg.sender;
        _initRound(block.timestamp);
    }

    receive() external payable {}

    function _floor10min(uint256 t) internal pure returns (uint256) {
        return (t / 600) * 600; // 600s = 10min
    }

    function _initRound(uint256 t) internal {
        roundStart = _floor10min(t);
        roundEnd = roundStart + 120; // allowed active window is first 2 minutes
        roundIndex = roundStart / 600;
        lastClicker = address(0);
        lastClickTime = 0;
    }

    // User 'clicks' by calling this payable function (optional small value accepted)
    function click() external payable {
        // If time has moved into next 10-min window, rotate round
        if (block.timestamp >= roundStart + 600) {
            // start new round
            _initRound(block.timestamp);
        }

        // Only accept clicks during the 2-minute active sub-window
        if (block.timestamp <= roundEnd) {
            lastClicker = msg.sender;
            lastClickTime = block.timestamp;
            emit Click(msg.sender, block.timestamp, roundIndex);
        } else {
            // clicks outside active window do nothing
            revert("inactive window");
        }
    }

    // Anyone can call to claim payout for the lastClicker once the active window has passed
    function claimWinner() external {
        // ensure active window ended and not in break period
        if (block.timestamp <= roundEnd) revert("active");
        // ensure that we are still in the same 10-min window (claim before next starts)
        if (block.timestamp >= roundStart + 600) {
            // too late; new round already started
            revert("round rotated");
        }

        address payable winner = payable(lastClicker);
        require(winner != address(0), "no winner");
        uint256 balance = address(this).balance;
        require(balance > 0, "no funds");
        // reset round state and send
        _initRound(block.timestamp);
        (bool ok,) = winner.call{value: balance}("");
        require(ok, "transfer failed");
        emit Payout(winner, balance, roundIndex);
    }

    // Admin helper to seed the pool
    function seed() external payable {}

    function getRoundInfo() external view returns (uint256 start, uint256 end, uint256 index) {
        return (roundStart, roundEnd, roundIndex);
    }
}
