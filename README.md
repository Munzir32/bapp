# Bitcoin Savings Circle Smart Contract

A decentralized smart contract for group Bitcoin savings with gamification features, designed for Bitcoin L2 solutions like Stacks or compatible rollups like Citrea.

## 🎯 Overview

This smart contract enables communities to create savings circles where members contribute Bitcoin regularly and receive payouts in rotation. It includes gamification elements like streaks, badges, and leaderboards to encourage consistent participation.

## ✨ Features

### Core Functionalities
- **CreateCircle()** - Create new savings circles with customizable parameters
- **JoinCircle()** - Join existing public circles or private circles by invitation
- **SubmitContribution()** - Make regular contributions to your circles
- **DistributePayout()** - Automated payout distribution to members in rotation
- **GetCircleStatus()** - Comprehensive circle information and member details

### Gamification Features
- **Streak Tracking** - Monitor consecutive contribution rounds
- **Badge System** - Earn badges for consistency and longevity
- **Leaderboard** - Compete with other members based on contributions and streaks
- **Achievement Levels** - NEWCOMER → CONSISTENT → VETERAN → CHAMPION → LEGEND

### Admin Functions
- **Member Management** - Circle owners can remove inactive members
- **Emergency Withdrawal** - Quorum-based emergency fund withdrawal
- **Circle Visibility** - Public or private circle settings

## 🏗 Architecture

### Smart Contract Structure

```solidity
contract BitcoinSavingsCircle {
    // Core data structures
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
}
```

### Key Functions

#### Circle Management
- `createCircle()` - Creates a new savings circle
- `joinCircle()` - Joins an existing circle
- `getCircleStatus()` - Returns comprehensive circle information

#### Contributions & Payouts
- `submitContribution()` - Submit regular contributions
- `distributePayout()` - Distribute payouts to members in rotation

#### Admin Functions
- `removeMember()` - Remove inactive members
- `emergencyWithdrawal()` - Emergency fund withdrawal with quorum

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Hardhat development environment

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bitcoin-savings-circle
```

2. Install dependencies:
```bash
npm install
```

3. Compile the contracts:
```bash
npm run compile
```

4. Run tests:
```bash
npm test
```

### Deployment

1. Set up your environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

2. Deploy to your target network:
```bash
npm run deploy -- --network <network-name>
```

## 📋 Usage Examples

### Creating a Circle

```javascript
// Create a weekly savings circle with 5 members
const circleId = await bitcoinSavingsCircle.createCircle(
    "Weekly Bitcoin Savers",
    ethers.utils.parseEther("0.001"), // 0.001 BTC per contribution
    0, // WEEKLY frequency
    5, // 5 members max
    0, // PUBLIC visibility
    { value: ethers.utils.parseEther("0.001") }
);
```

### Joining a Circle

```javascript
// Join an existing circle
await bitcoinSavingsCircle.joinCircle(
    circleId,
    { value: ethers.utils.parseEther("0.001") }
);
```

### Making Contributions

```javascript
// Submit contribution for current round
await bitcoinSavingsCircle.submitContribution(
    circleId,
    { value: ethers.utils.parseEther("0.001") }
);
```

### Distributing Payouts

```javascript
// Distribute payout to next member in rotation
await bitcoinSavingsCircle.distributePayout(circleId);
```

## 🎮 Gamification System

### Badge Levels
- **NEWCOMER** - Awarded when joining a circle
- **CONSISTENT** - 5+ consecutive contributions
- **VETERAN** - 10+ consecutive contributions
- **CHAMPION** - 20+ consecutive contributions
- **LEGEND** - 50+ consecutive contributions

### Leaderboard Scoring
```
Score = Total BTC Contributed + (Streak Count × 1000 wei)
```

## 🔒 Security Features

- **Reentrancy Protection** - Prevents reentrancy attacks
- **Access Control** - Circle owner permissions
- **Input Validation** - Comprehensive parameter validation
- **Emergency Withdrawal** - Quorum-based emergency procedures
- **Non-custodial** - Users maintain control of their funds

## 🌐 Blockchain Compatibility

This contract is designed to work with:
- **Bitcoin L2 Solutions** (Stacks, Lightning Network)
- **EVM-Compatible Rollups** (Citrea, Polygon, Arbitrum)
- **Cross-chain Bridges** for BTC deposits

## 📊 Events for Frontend Integration

The contract emits events for easy frontend integration:

```solidity
event CircleCreated(uint256 indexed circleId, string name, address indexed owner, uint256 contributionAmount);
event MemberJoined(uint256 indexed circleId, address indexed member);
event ContributionMade(uint256 indexed circleId, address indexed member, uint256 amount, uint256 round);
event PayoutSent(uint256 indexed circleId, address indexed recipient, uint256 amount, uint256 round);
event BadgeAwarded(uint256 indexed circleId, address indexed member, Badge badge);
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Test coverage includes:
- Circle creation and management
- Member joining and contributions
- Payout distribution
- Gamification features
- Admin functions
- Security scenarios

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For questions and support:
- Create an issue on GitHub
- Join our community discussions
- Check the documentation

---

**Note**: This smart contract is for educational and development purposes. Always audit and test thoroughly before deploying to mainnet with real funds. 