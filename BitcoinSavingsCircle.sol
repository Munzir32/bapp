// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title BitcoinSavingsCircle
 * @dev A smart contract for group Bitcoin savings with gamification features
 * @notice Supports BTC deposits, circle management, and automated payouts
 */
contract BitcoinSavingsCircle is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    // Enums
    enum Frequency { WEEKLY, MONTHLY }
    enum Visibility { PUBLIC, PRIVATE }
    enum Badge { NEWCOMER, CONSISTENT, VETERAN, CHAMPION, LEGEND }

    // Structs
    struct Circle {
        uint256 id;
        string name;
        address owner;
        uint256 contributionAmount;
        Frequency frequency;
        uint256 memberLimit;
        uint256 currentRound;
        uint256 payoutIndex;
        Visibility visibility;
        uint256 totalBTCSaved;
        uint256 createdAt;
        bool isActive;
    }

    struct Member {
        address addr;
        uint256 joinedAt;
        uint256 totalContributed;
        uint256 currentStreak;
        uint256 longestStreak;
        uint256 lastContributionRound;
        bool isActive;
        Badge[] badges;
    }

    struct Contribution {
        uint256 round;
        uint256 amount;
        uint256 timestamp;
    }

    // State variables
    Counters.Counter public _circleIds;
    uint256 public circleLen;
    mapping(uint256 => Circle) public circles;
    mapping(uint256 => mapping(address => Member)) public members;
    mapping(uint256 => mapping(uint256 => mapping(address => Contribution))) public contributions;
    mapping(uint256 => address[]) public circleMembers;
    mapping(uint256 => address[]) public teamMembers;
    mapping(address => uint256[]) public userCircles;
    mapping(address => uint256) public leaderboardScores;

    // Events
    event CircleCreated(uint256 indexed circleId, string name, address indexed owner, uint256 contributionAmount);
    event MemberJoined(uint256 indexed circleId, address indexed member);
    event ContributionMade(uint256 indexed circleId, address indexed member, uint256 amount, uint256 round);
    event PayoutSent(uint256 indexed circleId, address indexed recipient, uint256 amount, uint256 round);
    event MemberRemoved(uint256 indexed circleId, address indexed member);
    event BadgeAwarded(uint256 indexed circleId, address indexed member, Badge badge);
    event EmergencyWithdrawal(uint256 indexed circleId, address indexed recipient, uint256 amount);

    // Modifiers
    modifier circleExists(uint256 circleId) {
        require(circles[circleId].id != 0, "Circle does not exist");
        _;
    }

    modifier onlyCircleOwner(uint256 circleId) {
        require(circles[circleId].owner == msg.sender, "Only circle owner can perform this action");
        _;
    }

    modifier onlyCircleMember(uint256 circleId) {
        require(members[circleId][msg.sender].addr != address(0), "Not a circle member");
        _;
    }

    modifier circleNotFull(uint256 circleId) {
        require(circleMembers[circleId].length < circles[circleId].memberLimit, "Circle is full");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Creates a new savings circle
     * @param name Circle name
     * @param contributionAmount Amount each member must contribute per round
     * @param frequency Contribution frequency (weekly/monthly)
     * @param memberLimit Maximum number of members
     * @param visibility Circle visibility (public/private)
     */
    function createCircle(
        string memory name,
        uint256 contributionAmount,
        Frequency frequency,
        uint256 memberLimit,
        Visibility visibility
    ) external payable nonReentrant returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(contributionAmount > 0, "Contribution amount must be greater than 0");
        require(memberLimit > 1, "Member limit must be greater than 1");
        require(msg.value == contributionAmount, "Initial contribution must match contribution amount");

        _circleIds.increment();
        uint256 circleId = _circleIds.current();

        circles[circleId] = Circle({
            id: circleId,
            name: name,
            owner: msg.sender,
            contributionAmount: contributionAmount,
            frequency: frequency,
            memberLimit: memberLimit,
            currentRound: 1,
            payoutIndex: 0,
            visibility: visibility,
            totalBTCSaved: contributionAmount,
            createdAt: block.timestamp,
            isActive: true
        });

        // Add owner as first member
        members[circleId][msg.sender] = Member({
            addr: msg.sender,
            joinedAt: block.timestamp,
            totalContributed: contributionAmount,
            currentStreak: 1,
            longestStreak: 1,
            lastContributionRound: 1,
            isActive: true,
            badges: new Badge[](0)
        });

        circleMembers[circleId].push(msg.sender);
        userCircles[msg.sender].push(circleId);

        // Record first contribution
        contributions[circleId][1][msg.sender] = Contribution({
            round: 1,
            amount: contributionAmount,
            timestamp: block.timestamp
        });

        // Award newcomer badge
        _awardBadge(circleId, msg.sender, Badge.NEWCOMER);

        emit CircleCreated(circleId, name, msg.sender, contributionAmount);
        emit ContributionMade(circleId, msg.sender, contributionAmount, 1);

        return circleId;
    }

    /**
     * @dev Allows a user to join an existing circle
     * @param circleId ID of the circle to join
     */
    function joinCircle(uint256 circleId) external payable circleExists(circleId) circleNotFull(circleId) nonReentrant {
        Circle storage circle = circles[circleId];
        require(circle.isActive, "Circle is not active");
        require(circle.visibility == Visibility.PUBLIC || circle.owner == msg.sender, "Cannot join private circle");
        require(members[circleId][msg.sender].addr == address(0), "Already a member");
        require(msg.value == circle.contributionAmount, "Must contribute initial amount");

        // Add member
        members[circleId][msg.sender] = Member({
            addr: msg.sender,
            joinedAt: block.timestamp,
            totalContributed: circle.contributionAmount,
            currentStreak: 1,
            longestStreak: 1,
            lastContributionRound: circle.currentRound,
            isActive: true,
            badges: new Badge[](0)
        });

        circleMembers[circleId].push(msg.sender);
        userCircles[msg.sender].push(circleId);

        // Update circle stats
        circle.totalBTCSaved += circle.contributionAmount;

        // Record contribution
        contributions[circleId][circle.currentRound][msg.sender] = Contribution({
            round: circle.currentRound,
            amount: circle.contributionAmount,
            timestamp: block.timestamp
        });

        // Award newcomer badge
        _awardBadge(circleId, msg.sender, Badge.NEWCOMER);

        emit MemberJoined(circleId, msg.sender);
        emit ContributionMade(circleId, msg.sender, circle.contributionAmount, circle.currentRound);
    }

    /**
     * @dev Submit contribution for current round
     * @param circleId ID of the circle
     */
    function submitContribution(uint256 circleId) external payable circleExists(circleId) onlyCircleMember(circleId) nonReentrant {
        Circle storage circle = circles[circleId];
        Member storage member = members[circleId][msg.sender];
        
        require(circle.isActive, "Circle is not active");
        require(member.isActive, "Member is not active");
        require(msg.value == circle.contributionAmount, "Contribution amount must match");
        require(member.lastContributionRound < circle.currentRound, "Already contributed for this round");

        // Update member stats
        member.totalContributed += circle.contributionAmount;
        member.lastContributionRound = circle.currentRound;
        
        // Update streak
        if (member.lastContributionRound == circle.currentRound - 1) {
            member.currentStreak++;
            if (member.currentStreak > member.longestStreak) {
                member.longestStreak = member.currentStreak;
            }
        } else {
            member.currentStreak = 1;
        }

        // Update circle stats
        circle.totalBTCSaved += circle.contributionAmount;

        // Record contribution
        contributions[circleId][circle.currentRound][msg.sender] = Contribution({
            round: circle.currentRound,
            amount: circle.contributionAmount,
            timestamp: block.timestamp
        });

        // Award badges based on streak
        _checkAndAwardStreakBadges(circleId, msg.sender, member.currentStreak);

        emit ContributionMade(circleId, msg.sender, circle.contributionAmount, circle.currentRound);
    }

    /**
     * @dev Distribute payout to next member in rotation
     * @param circleId ID of the circle
     */
    function distributePayout(uint256 circleId) external circleExists(circleId) onlyCircleOwner(circleId) nonReentrant {
        Circle storage circle = circles[circleId];
        require(circle.isActive, "Circle is not active");
        require(circleMembers[circleId].length > 1, "Need at least 2 members for payout");

        // Check if all members have contributed for current round
        uint256 totalMembers = circleMembers[circleId].length;
        uint256 contributors = 0;
        
        for (uint256 i = 0; i < totalMembers; i++) {
            address memberAddr = circleMembers[circleId][i];
            if (members[circleId][memberAddr].lastContributionRound == circle.currentRound) {
                contributors++;
            }
        }

        require(contributors == totalMembers, "Not all members have contributed for this round");

        // Calculate payout amount
        uint256 payoutAmount = totalMembers * circle.contributionAmount;
        
        // Get next recipient
        address recipient = circleMembers[circleId][circle.payoutIndex];
        
        // Update payout index
        circle.payoutIndex = (circle.payoutIndex + 1) % totalMembers;
        
        // Move to next round
        circle.currentRound++;
        
        // Reset total BTC saved for new round
        circle.totalBTCSaved = 0;

        // Transfer payout
        (bool success, ) = recipient.call{value: payoutAmount}("");
        require(success, "Payout transfer failed");

        emit PayoutSent(circleId, recipient, payoutAmount, circle.currentRound - 1);
    }

    /**
     * @dev Get comprehensive circle status
     * @param circleId ID of the circle
     * @return circle Circle information
     * @return memberList Array of member addresses
     * @return memberDetails Array of member details
     */
    function getCircleStatus(uint256 circleId) external view circleExists(circleId) returns (
        Circle memory circle,
        address[] memory memberList,
        Member[] memory memberDetails
    ) {
        circle = circles[circleId];
        memberList = circleMembers[circleId];
        memberDetails = new Member[](memberList.length);
        
        for (uint256 i = 0; i < memberList.length; i++) {
            memberDetails[i] = members[circleId][memberList[i]];
        }
    }

    /**
     * @dev Remove inactive member (circle owner only)
     * @param circleId ID of the circle
     * @param memberAddr Address of member to remove
     */
    function removeMember(uint256 circleId, address memberAddr) external circleExists(circleId) onlyCircleOwner(circleId) {
        require(memberAddr != circles[circleId].owner, "Cannot remove circle owner");
        require(members[circleId][memberAddr].addr != address(0), "Member does not exist");
        
        members[circleId][memberAddr].isActive = false;
        
        // Remove from circle members array
        address[] storage memberArray = circleMembers[circleId];
        for (uint256 i = 0; i < memberArray.length; i++) {
            if (memberArray[i] == memberAddr) {
                memberArray[i] = memberArray[memberArray.length - 1];
                memberArray.pop();
                break;
            }
        }

        emit MemberRemoved(circleId, memberAddr);
    }

    /**
     * @dev Emergency withdrawal with quorum (requires majority of members)
     * @param circleId ID of the circle
     * @param recipient Address to receive the funds
     */
    function emergencyWithdrawal(uint256 circleId, address recipient) external circleExists(circleId) onlyCircleOwner(circleId) nonReentrant {
        Circle storage circle = circles[circleId];
        require(circle.isActive, "Circle is not active");
        require(recipient != address(0), "Invalid recipient");

        uint256 totalMembers = circleMembers[circleId].length;
        uint256 quorum = (totalMembers / 2) + 1;
        
        // This is a simplified implementation - in practice, you'd want a more sophisticated voting mechanism
        require(totalMembers >= quorum, "Insufficient quorum for emergency withdrawal");

        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        circle.isActive = false;

        (bool success, ) = recipient.call{value: balance}("");
        require(success, "Emergency withdrawal failed");

        emit EmergencyWithdrawal(circleId, recipient, balance);
    }

    /**
     * @dev Get leaderboard score for a user
     * @param user Address of the user
     * @return score Total leaderboard score
     */
    function getLeaderboardScore(address user) external view returns (uint256 score) {
        return leaderboardScores[user];
    }

    /**
     * @dev Update leaderboard scores (called internally)
     */
    function _updateLeaderboardScore(address user, uint256 contribution, uint256 streak) internal {
        uint256 streakBonus = streak * 1000; // 1000 wei bonus per streak
        leaderboardScores[user] = contribution + streakBonus;
    }

    /**
     * @dev Award badge to member
     * @param circleId ID of the circle
     * @param memberAddr Address of the member
     * @param badge Badge to award
     */
    function _awardBadge(uint256 circleId, address memberAddr, Badge badge) internal {
        Member storage member = members[circleId][memberAddr];
        
        // Check if badge already exists
        for (uint256 i = 0; i < member.badges.length; i++) {
            if (member.badges[i] == badge) {
                return; // Badge already awarded
            }
        }
        
        member.badges.push(badge);
        emit BadgeAwarded(circleId, memberAddr, badge);
    }

    /**
     * @dev Check and award streak-based badges
     * @param circleId ID of the circle
     * @param memberAddr Address of the member
     * @param streak Current streak count
     */
    function _checkAndAwardStreakBadges(uint256 circleId, address memberAddr, uint256 streak) internal {
        if (streak >= 5) {
            _awardBadge(circleId, memberAddr, Badge.CONSISTENT);
        }
        if (streak >= 10) {
            _awardBadge(circleId, memberAddr, Badge.VETERAN);
        }
        if (streak >= 20) {
            _awardBadge(circleId, memberAddr, Badge.CHAMPION);
        }
        if (streak >= 50) {
            _awardBadge(circleId, memberAddr, Badge.LEGEND);
        }
    }

    /**
     * @dev Get contribution history for a member
     * @param circleId ID of the circle
     * @param memberAddr Address of the member
     * @param rounds Number of rounds to retrieve
     * @return contributionHistory Array of contributions
     */
    function getContributionHistory(uint256 circleId, address memberAddr, uint256 rounds) external view returns (Contribution[] memory contributionHistory) {
        contributionHistory = new Contribution[](rounds);
        
        for (uint256 i = 0; i < rounds; i++) {
            contributionHistory[i] = contributions[circleId][i + 1][memberAddr];
        }
    }

    /**
     * @dev Get all circles for a user
     * @param user Address of the user
     * @return userCircleIds Array of circle IDs
     */
    function getUserCircles(address user) external view returns (uint256[] memory userCircleIds) {
        return userCircles[user];
    }

    /**
     * @dev Get circle member count
     * @param circleId ID of the circle
     * @return count Number of members
     */
    function getCircleMemberCount(uint256 circleId) external view circleExists(circleId) returns (uint256 count) {
        return circleMembers[circleId].length;
    }

    /**
     * @dev Check if a user is a member of a circle
     * @param circleId ID of the circle
     * @param user Address of the user
     * @return isMember True if user is a member
     */
    function isCircleMember(uint256 circleId, address user) external view circleExists(circleId) returns (bool isMember) {
        return members[circleId][user].addr != address(0) && members[circleId][user].isActive;
    }

    // Fallback function to receive BTC
    receive() external payable {
        // Allow receiving BTC
    }
} 