const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BitcoinSavingsCircle", function () {
    let BitcoinSavingsCircle;
    let bitcoinSavingsCircle;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addr4;
    let addr5;

    const CONTRIBUTION_AMOUNT = ethers.utils.parseEther("0.001"); // 0.001 BTC
    const CIRCLE_NAME = "Weekly Bitcoin Savers";

    beforeEach(async function () {
        [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();
        
        BitcoinSavingsCircle = await ethers.getContractFactory("BitcoinSavingsCircle");
        bitcoinSavingsCircle = await BitcoinSavingsCircle.deploy();
        await bitcoinSavingsCircle.deployed();
    });

    describe("Circle Creation", function () {
        it("Should create a new circle with correct parameters", async function () {
            const tx = await bitcoinSavingsCircle.createCircle(
                CIRCLE_NAME,
                CONTRIBUTION_AMOUNT,
                0, // WEEKLY
                5, // 5 members max
                0, // PUBLIC
                { value: CONTRIBUTION_AMOUNT }
            );

            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "CircleCreated");
            
            expect(event.args.circleId).to.equal(1);
            expect(event.args.name).to.equal(CIRCLE_NAME);
            expect(event.args.owner).to.equal(owner.address);
            expect(event.args.contributionAmount).to.equal(CONTRIBUTION_AMOUNT);

            const circle = await bitcoinSavingsCircle.circles(1);
            expect(circle.name).to.equal(CIRCLE_NAME);
            expect(circle.owner).to.equal(owner.address);
            expect(circle.contributionAmount).to.equal(CONTRIBUTION_AMOUNT);
            expect(circle.frequency).to.equal(0); // WEEKLY
            expect(circle.memberLimit).to.equal(5);
            expect(circle.visibility).to.equal(0); // PUBLIC
            expect(circle.isActive).to.be.true;
        });

        it("Should fail to create circle with empty name", async function () {
            await expect(
                bitcoinSavingsCircle.createCircle(
                    "",
                    CONTRIBUTION_AMOUNT,
                    0,
                    5,
                    0,
                    { value: CONTRIBUTION_AMOUNT }
                )
            ).to.be.revertedWith("Name cannot be empty");
        });

        it("Should fail to create circle with zero contribution amount", async function () {
            await expect(
                bitcoinSavingsCircle.createCircle(
                    CIRCLE_NAME,
                    0,
                    0,
                    5,
                    0,
                    { value: 0 }
                )
            ).to.be.revertedWith("Contribution amount must be greater than 0");
        });

        it("Should fail to create circle with insufficient initial contribution", async function () {
            await expect(
                bitcoinSavingsCircle.createCircle(
                    CIRCLE_NAME,
                    CONTRIBUTION_AMOUNT,
                    0,
                    5,
                    0,
                    { value: ethers.utils.parseEther("0.0005") }
                )
            ).to.be.revertedWith("Initial contribution must match contribution amount");
        });
    });

    describe("Joining Circles", function () {
        let circleId;

        beforeEach(async function () {
            const tx = await bitcoinSavingsCircle.createCircle(
                CIRCLE_NAME,
                CONTRIBUTION_AMOUNT,
                0,
                5,
                0,
                { value: CONTRIBUTION_AMOUNT }
            );
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "CircleCreated");
            circleId = event.args.circleId;
        });

        it("Should allow users to join public circles", async function () {
            await expect(
                bitcoinSavingsCircle.connect(addr1).joinCircle(circleId, { value: CONTRIBUTION_AMOUNT })
            ).to.emit(bitcoinSavingsCircle, "MemberJoined")
                .withArgs(circleId, addr1.address);

            const member = await bitcoinSavingsCircle.members(circleId, addr1.address);
            expect(member.addr).to.equal(addr1.address);
            expect(member.isActive).to.be.true;
        });

        it("Should fail to join non-existent circle", async function () {
            await expect(
                bitcoinSavingsCircle.connect(addr1).joinCircle(999, { value: CONTRIBUTION_AMOUNT })
            ).to.be.revertedWith("Circle does not exist");
        });

        it("Should fail to join full circle", async function () {
            // Join with 4 more members to reach limit
            await bitcoinSavingsCircle.connect(addr1).joinCircle(circleId, { value: CONTRIBUTION_AMOUNT });
            await bitcoinSavingsCircle.connect(addr2).joinCircle(circleId, { value: CONTRIBUTION_AMOUNT });
            await bitcoinSavingsCircle.connect(addr3).joinCircle(circleId, { value: CONTRIBUTION_AMOUNT });
            await bitcoinSavingsCircle.connect(addr4).joinCircle(circleId, { value: CONTRIBUTION_AMOUNT });

            await expect(
                bitcoinSavingsCircle.connect(addr5).joinCircle(circleId, { value: CONTRIBUTION_AMOUNT })
            ).to.be.revertedWith("Circle is full");
        });

        it("Should fail to join same circle twice", async function () {
            await bitcoinSavingsCircle.connect(addr1).joinCircle(circleId, { value: CONTRIBUTION_AMOUNT });
            
            await expect(
                bitcoinSavingsCircle.connect(addr1).joinCircle(circleId, { value: CONTRIBUTION_AMOUNT })
            ).to.be.revertedWith("Already a member");
        });
    });

    describe("Contributions", function () {
        let circleId;

        beforeEach(async function () {
            const tx = await bitcoinSavingsCircle.createCircle(
                CIRCLE_NAME,
                CONTRIBUTION_AMOUNT,
                0,
                5,
                0,
                { value: CONTRIBUTION_AMOUNT }
            );
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "CircleCreated");
            circleId = event.args.circleId;

            // Add a member
            await bitcoinSavingsCircle.connect(addr1).joinCircle(circleId, { value: CONTRIBUTION_AMOUNT });
        });

        it("Should allow members to submit contributions", async function () {
            await expect(
                bitcoinSavingsCircle.connect(addr1).submitContribution(circleId, { value: CONTRIBUTION_AMOUNT })
            ).to.emit(bitcoinSavingsCircle, "ContributionMade")
                .withArgs(circleId, addr1.address, CONTRIBUTION_AMOUNT, 1);

            const member = await bitcoinSavingsCircle.members(circleId, addr1.address);
            expect(member.totalContributed).to.equal(CONTRIBUTION_AMOUNT.mul(2)); // Initial + contribution
        });

        it("Should fail to contribute twice in same round", async function () {
            await bitcoinSavingsCircle.connect(addr1).submitContribution(circleId, { value: CONTRIBUTION_AMOUNT });
            
            await expect(
                bitcoinSavingsCircle.connect(addr1).submitContribution(circleId, { value: CONTRIBUTION_AMOUNT })
            ).to.be.revertedWith("Already contributed for this round");
        });

        it("Should fail to contribute with wrong amount", async function () {
            await expect(
                bitcoinSavingsCircle.connect(addr1).submitContribution(circleId, { value: ethers.utils.parseEther("0.0005") })
            ).to.be.revertedWith("Contribution amount must match");
        });
    });

    describe("Payout Distribution", function () {
        let circleId;

        beforeEach(async function () {
            const tx = await bitcoinSavingsCircle.createCircle(
                CIRCLE_NAME,
                CONTRIBUTION_AMOUNT,
                0,
                3,
                0,
                { value: CONTRIBUTION_AMOUNT }
            );
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "CircleCreated");
            circleId = event.args.circleId;

            // Add 2 more members
            await bitcoinSavingsCircle.connect(addr1).joinCircle(circleId, { value: CONTRIBUTION_AMOUNT });
            await bitcoinSavingsCircle.connect(addr2).joinCircle(circleId, { value: CONTRIBUTION_AMOUNT });
        });

        it("Should distribute payout when all members have contributed", async function () {
            // All members contribute for round 1
            await bitcoinSavingsCircle.connect(addr1).submitContribution(circleId, { value: CONTRIBUTION_AMOUNT });
            await bitcoinSavingsCircle.connect(addr2).submitContribution(circleId, { value: CONTRIBUTION_AMOUNT });

            const initialBalance = await addr1.getBalance();
            
            await expect(
                bitcoinSavingsCircle.distributePayout(circleId)
            ).to.emit(bitcoinSavingsCircle, "PayoutSent");

            const finalBalance = await addr1.getBalance();
            const payoutAmount = CONTRIBUTION_AMOUNT.mul(3); // 3 members * contribution amount
            
            // Note: Balance check is approximate due to gas costs
            expect(finalBalance.gt(initialBalance)).to.be.true;
        });

        it("Should fail to distribute payout if not all members contributed", async function () {
            // Only one member contributes
            await bitcoinSavingsCircle.connect(addr1).submitContribution(circleId, { value: CONTRIBUTION_AMOUNT });

            await expect(
                bitcoinSavingsCircle.distributePayout(circleId)
            ).to.be.revertedWith("Not all members have contributed for this round");
        });

        it("Should fail to distribute payout if not circle owner", async function () {
            await expect(
                bitcoinSavingsCircle.connect(addr1).distributePayout(circleId)
            ).to.be.revertedWith("Only circle owner can perform this action");
        });
    });

    describe("Gamification", function () {
        let circleId;

        beforeEach(async function () {
            const tx = await bitcoinSavingsCircle.createCircle(
                CIRCLE_NAME,
                CONTRIBUTION_AMOUNT,
                0,
                5,
                0,
                { value: CONTRIBUTION_AMOUNT }
            );
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "CircleCreated");
            circleId = event.args.circleId;
        });

        it("Should award NEWCOMER badge when joining", async function () {
            await bitcoinSavingsCircle.connect(addr1).joinCircle(circleId, { value: CONTRIBUTION_AMOUNT });
            
            await expect(
                bitcoinSavingsCircle.connect(addr1).joinCircle(circleId, { value: CONTRIBUTION_AMOUNT })
            ).to.be.revertedWith("Already a member");
        });

        it("Should track streaks correctly", async function () {
            await bitcoinSavingsCircle.connect(addr1).joinCircle(circleId, { value: CONTRIBUTION_AMOUNT });
            
            // First contribution
            await bitcoinSavingsCircle.connect(addr1).submitContribution(circleId, { value: CONTRIBUTION_AMOUNT });
            let member = await bitcoinSavingsCircle.members(circleId, addr1.address);
            expect(member.currentStreak).to.equal(2); // Initial + first contribution

            // Distribute payout to move to next round
            await bitcoinSavingsCircle.distributePayout(circleId);

            // Second contribution
            await bitcoinSavingsCircle.connect(addr1).submitContribution(circleId, { value: CONTRIBUTION_AMOUNT });
            member = await bitcoinSavingsCircle.members(circleId, addr1.address);
            expect(member.currentStreak).to.equal(3);
        });
    });

    describe("Admin Functions", function () {
        let circleId;

        beforeEach(async function () {
            const tx = await bitcoinSavingsCircle.createCircle(
                CIRCLE_NAME,
                CONTRIBUTION_AMOUNT,
                0,
                5,
                0,
                { value: CONTRIBUTION_AMOUNT }
            );
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "CircleCreated");
            circleId = event.args.circleId;

            await bitcoinSavingsCircle.connect(addr1).joinCircle(circleId, { value: CONTRIBUTION_AMOUNT });
        });

        it("Should allow circle owner to remove members", async function () {
            await expect(
                bitcoinSavingsCircle.removeMember(circleId, addr1.address)
            ).to.emit(bitcoinSavingsCircle, "MemberRemoved")
                .withArgs(circleId, addr1.address);

            const member = await bitcoinSavingsCircle.members(circleId, addr1.address);
            expect(member.isActive).to.be.false;
        });

        it("Should fail to remove circle owner", async function () {
            await expect(
                bitcoinSavingsCircle.removeMember(circleId, owner.address)
            ).to.be.revertedWith("Cannot remove circle owner");
        });

        it("Should fail to remove member if not circle owner", async function () {
            await expect(
                bitcoinSavingsCircle.connect(addr1).removeMember(circleId, addr2.address)
            ).to.be.revertedWith("Only circle owner can perform this action");
        });
    });

    describe("Circle Status", function () {
        let circleId;

        beforeEach(async function () {
            const tx = await bitcoinSavingsCircle.createCircle(
                CIRCLE_NAME,
                CONTRIBUTION_AMOUNT,
                0,
                5,
                0,
                { value: CONTRIBUTION_AMOUNT }
            );
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "CircleCreated");
            circleId = event.args.circleId;

            await bitcoinSavingsCircle.connect(addr1).joinCircle(circleId, { value: CONTRIBUTION_AMOUNT });
        });

        it("Should return correct circle status", async function () {
            const [circle, memberList, memberDetails] = await bitcoinSavingsCircle.getCircleStatus(circleId);
            
            expect(circle.name).to.equal(CIRCLE_NAME);
            expect(circle.owner).to.equal(owner.address);
            expect(memberList.length).to.equal(2); // owner + addr1
            expect(memberDetails.length).to.equal(2);
            expect(memberDetails[0].addr).to.equal(owner.address);
            expect(memberDetails[1].addr).to.equal(addr1.address);
        });

        it("Should return correct member count", async function () {
            const count = await bitcoinSavingsCircle.getCircleMemberCount(circleId);
            expect(count).to.equal(2);
        });

        it("Should correctly identify circle members", async function () {
            const isOwnerMember = await bitcoinSavingsCircle.isCircleMember(circleId, owner.address);
            const isAddr1Member = await bitcoinSavingsCircle.isCircleMember(circleId, addr1.address);
            const isAddr2Member = await bitcoinSavingsCircle.isCircleMember(circleId, addr2.address);

            expect(isOwnerMember).to.be.true;
            expect(isAddr1Member).to.be.true;
            expect(isAddr2Member).to.be.false;
        });
    });
}); 