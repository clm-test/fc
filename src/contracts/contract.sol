// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.9/contracts/access/Ownable.sol";

contract FirstCast is ERC721URIStorage, Ownable {
    string public baseURI;
    uint256 public mintFee = 0.0003 ether;

    event Minted(address indexed minter, uint256 fid, string hash);

    constructor() ERC721("First Cast", "FC") {
        baseURI = "https://firstcast.vercel.app/api/metadata";
    }

    function mintNFT(uint256 fid, string memory hash) public payable {
        require(msg.value >= mintFee, "Insufficient ETH sent");

        // Make sure this fid hasn't already been minted
        require(!_minted(fid), "You already minted your first cast");

        _safeMint(msg.sender, fid);

        string memory fullTokenURI = string(
            abi.encodePacked(
                baseURI,
                "?fid=",
                toString(fid),
                "&hash=",
                hash
            )
        );

        _setTokenURI(fid, fullTokenURI);

        payable(owner()).transfer(msg.value);

        emit Minted(msg.sender, fid, hash);
    }

    function _minted(uint256 tokenId) internal view returns (bool) {
        return _exists(tokenId);
    }

    function updateBaseURI(string memory newBaseURI) public onlyOwner {
        baseURI = newBaseURI;
    }

    function updateMintFee(uint256 newFee) public onlyOwner {
        mintFee = newFee;
    }

    // Helper to convert uint256 to string
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
