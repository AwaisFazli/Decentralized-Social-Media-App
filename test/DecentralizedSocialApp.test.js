/* eslint-disable jest/valid-expect */
/* eslint-disable jest/valid-describe-callback */
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DecentralizedSocialApp", function () {

    let decentralizedSocialApp
    let deployer, user1, user2, users
    let URI = "SampleURI"
    let poshHash = "SampleSHA256HashCode"

    beforeEach(async () => {
        // get users from development accounts
        [deployer, user1, user2, ...users] = await ethers.getSigners();

        const DecentralizedSocialApp = await ethers.getContractFactory("DecentralizedSocialApp") // get contract factory to deploy the contract

        decentralizedSocialApp = await DecentralizedSocialApp.deploy();

        await decentralizedSocialApp.connect(user1).mint(URI)
    })

    describe("Deployment", async() => {
        it("Should track name symbol", async function () {
            const nftName = "DecentralizedSocialApp"
            const nftSymbol = "DAPP"

            expect(await decentralizedSocialApp.name()).to.equal(nftName);
            expect(await decentralizedSocialApp.symbol()).to.equal(nftSymbol);
        });
    })

    describe("Minting NFTs", async () => {
        it("Should Track each minted NFT", async function () {
            expect(await decentralizedSocialApp.tokenCount()).to.equal(1);
            expect(await decentralizedSocialApp.balanceOf(user1.address)).to.equal(1);
            expect(await decentralizedSocialApp.tokenURI(1)).to.equal(URI);

            // user2 mints an nft
            await decentralizedSocialApp.connect(user2).mint(URI)
            expect(await decentralizedSocialApp.tokenCount()).to.equal(2);
            expect(await decentralizedSocialApp.balanceOf(user1.address)).to.equal(1);
            expect(await decentralizedSocialApp.tokenURI(1)).to.equal(URI);
        })
    })

    describe("Setting Profile", async () => {
        it("Should allow users to select which NFT they own to represent their Profiles", async function() {
            //  user 1 mints another NFT
            await decentralizedSocialApp.connect(user1).mint(URI)
            // By default new minted NFT is set as profile 
            expect(await decentralizedSocialApp.profiles(user1.address)).to.equal(2)
            // user 1 sets prodile to their minted nft
            await decentralizedSocialApp.connect(user1).setProfile(1)
            expect(await decentralizedSocialApp.profiles(user1.address)).to.equal(1)

            // Fail Case
            // User 2 tries to set their profiles to nft number 2 owned by user 1
            await expect(
                decentralizedSocialApp.connect(user2).setProfile(2)
            ).to.be.revertedWith("Must Own the nft you want to select as your profile")
        })
    })
});
