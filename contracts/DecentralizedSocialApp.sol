// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract DecentralizedSocialApp is ERC721URIStorage {

    uint256 public tokenCount;
    uint256 public postCount;

    mapping(uint256 => Post) public posts;
    mapping(address => uint256) public profiles; // address => NFT id

    struct Post {
        uint256 id;
        string hash;
        address author;
    }

    event PostCreated(
        uint256 id,
        string hash,
        address author
    );

    constructor() ERC721("DecentralizedSocialApp", "DAPP") {}

    function mint(string memory _tokenURI) external returns (uint256){
        tokenCount++;
        _safeMint(msg.sender, tokenCount); // internal function provided by ERC721 to mint the NFT for the caller of function (msg.sender) with id of token count
        _setTokenURI(tokenCount, _tokenURI); // mint the token URi

        return (tokenCount);
    }

}
