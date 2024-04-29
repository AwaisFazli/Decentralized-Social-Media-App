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
});
