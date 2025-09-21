// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

/**
 * LastClickPoolVRF
 * - Uses Chainlink VRF v2 to request a single random offset inside the 2-minute
 *   active window. The contract owner (or an off-chain keeper) can request randomness
 *   while the active window is open; when the random number is fulfilled it sets
 *   `randomOffset` (seconds) which is used to determine the exact end time.
 * - For PoC: an off-chain keeper still triggers the VRF request; randomness is
 *   verifiable on-chain upon fulfillment.
 */
contract LastClickPoolVRF is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface public COORD;
    uint64 public subscriptionId;
    bytes32 public keyHash;
    uint32 public callbackGasLimit = 200000;
    uint16 public requestConfirmations = 3;

    address public owner;
    address public lastClicker;
    uint256 public lastClickTime;
    uint256 public roundStart;
    uint256 public roundEnd;
    uint256 public roundIndex;
    uint256 public randomOffset; // seconds into active window (0..120)
    uint256 public lastRequestId;

    event Click(address indexed who, uint256 time, uint256 round);
    event Payout(address indexed winner, uint256 amount, uint256 round);
    event RandomRequested(uint256 requestId);
    event RandomFulfilled(uint256 requestId, uint256 randomOffset);

    constructor(address vrfCoordinator, bytes32 _keyHash, uint64 _subId) VRFConsumerBaseV2(vrfCoordinator) {
        COORD = VRFCoordinatorV2Interface(vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subId;
        owner = msg.sender;
        _initRound(block.timestamp);
    }

    receive() external payable {}

    function _floor10min(uint256 t) internal pure returns (uint256) {
        return (t / 600) * 600;
    }

    function _initRound(uint256 t) internal {
        roundStart = _floor10min(t);
        roundEnd = roundStart + 120; // active window
        roundIndex = roundStart / 600;
        lastClicker = address(0);
        lastClickTime = 0;
        randomOffset = 0;
    }

    function click() external payable {
        if (block.timestamp >= roundStart + 600) {
            _initRound(block.timestamp);
        }
        if (block.timestamp <= roundEnd) {
            lastClicker = msg.sender;
            lastClickTime = block.timestamp;
            emit Click(msg.sender, block.timestamp, roundIndex);
        } else {
            revert("inactive window");
        }
    }

    // Request verifiable randomness to pick an offset (in seconds) inside the active window
    function requestRandomOffset() external returns (uint256 requestId) {
        // Only allow while active window is open
        require(block.timestamp <= roundEnd, "not in active window");
        // create request
        requestId = COORD.requestRandomWords(keyHash, subscriptionId, requestConfirmations, callbackGasLimit, 1);
        lastRequestId = requestId;
        emit RandomRequested(requestId);
        return requestId;
    }

    // VRF callback
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        // Map random to 0..119 seconds inside the active window
        uint256 rnd = randomWords[0] % 120;
        randomOffset = rnd;
        emit RandomFulfilled(requestId, rnd);
    }

    // Anyone can call to claim after active window but respecting randomOffset
    function claimWinner() external {
        // ensure randomOffset set
        require(randomOffset > 0, "no random set");
        uint256 effectiveEnd = roundStart + randomOffset;
        // active must be over
        require(block.timestamp > effectiveEnd, "active");
        // ensure same 10-min window
        require(block.timestamp < roundStart + 600, "round rotated");

        address payable winner = payable(lastClicker);
        require(winner != address(0), "no winner");
        uint256 balance = address(this).balance;
        require(balance > 0, "no funds");
        _initRound(block.timestamp);
        (bool ok,) = winner.call{value: balance}("");
        require(ok, "transfer failed");
        emit Payout(winner, balance, roundIndex);
    }

    function seed() external payable {}

    function getRoundInfo() external view returns (uint256 start, uint256 end, uint256 index, uint256 rndOffset) {
        return (roundStart, roundEnd, roundIndex, randomOffset);
    }

    // admin helpers
    function setCallbackGasLimit(uint32 g) external { require(msg.sender == owner); callbackGasLimit = g; }
    function setSubscriptionId(uint64 s) external { require(msg.sender == owner); subscriptionId = s; }
}
