// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "lib/openzeppelin-contracts/contracts/utils/Strings.sol";
import "./Utils/ReentrancyGuard.sol";
import "./SnapshotNFT.sol";
import "./SeedFactory.sol";

/**
 * @title SeedNFT
 * @dev Single ERC721 contract for all art seeds
 * Each token ID represents a different seed artwork
 */
contract SeedNFT is ERC721Enumerable, Ownable, ReentrancyGuard {
    
    
    // Core contract addresses
    address public factory;
    
    // Metadata
    string private _baseTokenURI;
    string private _contractURI;

    // Seed data structure
    struct SeedData {
        uint32 creationBlock;
        uint32 creationTime;
        string location;
    }

    // Storage mappings
    mapping(uint256 => SeedData) private _seedData;
    uint256 private _nextSeedId = 1;
    

    
    event SeedMinted(uint256 indexed seedId, address indexed to, uint256 timestamp, uint256 blockNumber, uint256 snapshotPrice, string location);
    event FactorySet(address indexed factory);
    event SeedSnapshot(uint256 indexed snapshotId, uint256 indexed seedId, uint256 indexed beneficiaryIndex, address creator, string processId);
    event BaseURISet(string baseURI);
    event ContractURIUpdated(string newContractURI);            
    
    // ============ ERRORS ============
    error OnlyFactory();
    error OnlySeedHolder();
    error InvalidSeedId();
    error InvalidBeneficiaryIndex();
    error IncorrectMintPrice();
    error ContractsNotSet();
    error TransferFailed();
    

    modifier onlyFactory() {
        if (msg.sender != factory) revert OnlyFactory();
        _;
    }
    
   
    /**
     * @dev Constructor to initialize the seed NFT collection
     * @param _initialOwner The initial owner (factory contract)
     */
    constructor(address _initialOwner) ERC721("Way of Flowers Seed", "SEED") Ownable(_initialOwner) {
        require(_initialOwner != address(0), "SeedNFT: Invalid initial owner");
        _baseTokenURI = "";
        _contractURI = "";
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set the SeedFactory contract address (only owner)
     * @param _factory Address of the SeedFactory contract
     */
    function setFactory(address _factory) external onlyOwner {
        require(_factory != address(0), "SeedNFT: Invalid factory");
        factory = _factory;
        emit FactorySet(_factory);
    }

    /**
     * @dev Set the base URI for token metadata (only owner)
     * @param baseURI The new base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURISet(baseURI);
    }
    
    /**
     * @dev Set the contract URI for OpenSea collection metadata (only owner)
     * @param newContractURI The new contract URI
     */
    function setContractURI(string memory newContractURI) external onlyOwner {
        _contractURI = newContractURI;
        emit ContractURIUpdated(newContractURI);
    }

    /**
     * @dev Get the current base URI
     * @return The current base URI
     */
    function getBaseURI() external view returns (string memory) {
        return _baseTokenURI;
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Mint a new seed NFT (only factory contract)
     * @param to Address to mint the seed to
     * @param snapshotPrice The price for snapshots from this seed
     * @return seedId The ID of the newly minted seed
     */
    function mintSeed(address to, uint256 snapshotPrice, string calldata location) external onlyFactory nonReentrant returns (uint256) {
        require(to != address(0), "SeedNFT: Cannot mint to zero address");
        require(snapshotPrice >= 0, "SeedNFT: Snapshot price must be greater than or equal to 0");
        require(bytes(location).length > 0, "SeedNFT: Location cannot be empty");
        
        uint256 seedId = _nextSeedId;
        _nextSeedId++;

        // Store the metadata for this seed
        _seedData[seedId] = SeedData({
            creationBlock: uint32(block.number),
            creationTime: uint32(block.timestamp),
            location: location
        });
        
        // Mint the seed NFT
        _mint(to, seedId);
        emit SeedMinted(seedId, to, block.timestamp, block.number, snapshotPrice, location);
        
        return seedId;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get the next seed ID that will be minted
     * @return The next seed ID
     */
    function getNextSeedId() external view returns (uint256) {
        return _nextSeedId;
    }
    
    /**
     * @dev Get the total number of seeds minted
     * @return The total seed count
     */
    function getTotalSeeds() external view returns (uint256) {
        return _nextSeedId - 1;
    }
    
    /**
     * @dev Get all seed IDs owned by a specific address
     * @param owner The address to get seeds for
     * @return Array of seed token IDs owned by the address
     */
    function getSeedsByOwner(address owner) external view returns (uint256[] memory) {
        uint256 ownerBalance = balanceOf(owner);
        uint256[] memory seedIds = new uint256[](ownerBalance);
        
        // Use the built-in enumerable function
        for (uint256 i = 0; i < ownerBalance; i++) {
            seedIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return seedIds;
    }
    
    /**
     * @dev Get seed ID by index (for enumeration)
     * @param index The index of the seed (0-based)
     * @return The seed ID at the given index
     */
    function getSeedByIndex(uint256 index) external view returns (uint256) {
        require(index < totalSupply(), "SeedNFT: Index out of bounds");
        return tokenByIndex(index);
    }
    
    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Get seed creation metadata
     * @param seedId The seed token ID
     * @return timestamp Block timestamp when seed was created
     * @return blockNumber Block number when seed was created
     */

    
    
    /**
     * @dev Check if a token exists
     * @param tokenId The token ID to check
     * @return True if the token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        try this.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @dev Get seed creation metadata
     * @param seedId The seed token ID
     * @return timestamp Block timestamp when seed was created
     * @return blockNumber Block number when seed was created
     */
    function getSeedMetadata(uint256 seedId) public view returns (uint256 timestamp, uint256 blockNumber) {
        if (!_exists(seedId)) revert InvalidSeedId();
        SeedData memory metadata = _seedData[seedId];
        return (uint256(metadata.creationTime), uint256(metadata.creationBlock));
    }

    /**
     * @dev Get the location of a seed
     * @param seedId The seed token ID
     * @return location The location string for this seed
     */
    function getSeedLocation(uint256 seedId) public view returns (string memory location) {
        if (!_exists(seedId)) revert InvalidSeedId();
        return _seedData[seedId].location;
    }

    /**
     * @dev Get the creation block of a seed (backward compatibility)
     * @param seedId The seed token ID
     * @return The block number when the seed was created
     */
    function seedCreationBlock(uint256 seedId) public view returns (uint256) {
        if (!_exists(seedId)) revert InvalidSeedId();
        return uint256(_seedData[seedId].creationBlock);
    }

    /**
     * @dev Get the creation time of a seed (backward compatibility)
     * @param seedId The seed token ID
     * @return The timestamp when the seed was created
     */
    function seedCreationTime(uint256 seedId) public view returns (uint256) {
        if (!_exists(seedId)) revert InvalidSeedId();
        return uint256(_seedData[seedId].creationTime);
    }

    /**
     * @dev Get the location of a seed (backward compatibility)
     * @param seedId The seed token ID
     * @return The location string for this seed
     */
    function seedLocations(uint256 seedId) public view returns (string memory) {
        if (!_exists(seedId)) revert InvalidSeedId();
        return _seedData[seedId].location;
    }

    /**
     * @dev Build JSON metadata for a seed NFT
     * @param seedId The seed token ID
     * @return JSON metadata string
     */
    function _buildSeedMetadata(uint256 seedId) internal view returns (string memory) {
        string memory baseURI = _baseURI();
        string memory imageUrl;

        if (bytes(baseURI).length > 0) {
            imageUrl = string(abi.encodePacked(
                baseURI,
                "seed", Strings.toString(seedId),
                "/seed.png"
            ));
        }
        // Build JSON metadata
        return string(abi.encodePacked(
            '{"name": "Way of Flowers Seed #', Strings.toString(seedId),
            '", "description": "A unique seed in the Way of Flowers ecosystem. Watch it evolve through snapshots.", ',
            '"image": "', imageUrl, '", ',
            '"attributes": [',
            _buildSeedAttributes(seedId),
            ', ',
            ']'
        ));
    }

    /**
     * @dev Build attributes array for seed metadata
     * @param seedId The seed token ID
     * @return JSON attributes string
     */
    function _buildSeedAttributes(uint256 seedId) internal view returns (string memory) {
        // Add any seed-specific attributes here
        // Get seed metadata for attributes
        (uint256 timestamp, ) = getSeedMetadata(seedId);
        string memory location = getSeedLocation(seedId);

        return string(abi.encodePacked(
            '{"trait_type": "Location", "value": "', location, '"}, ',
            '{"trait_type": "Timestamp", "value": ', Strings.toString(timestamp), '}, ',
            '{"trait_type": "Type", "value": "Seed"}'
        ));
    }

    // ============ ERC721 OVERRIDES ============
    
    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev See {ERC721-_update}
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override(ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @dev See {ERC721-_increaseBalance}
     */
    function _increaseBalance(address account, uint128 amount) internal virtual override(ERC721Enumerable) {
        super._increaseBalance(account, amount);
    }
    

    
    /**
     * @dev Override tokenURI to provide seed-specific metadata
     * @param tokenId The token ID
     * @return The token URI (JSON metadata)
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert InvalidSeedId();
        return _buildSeedMetadata(tokenId);
    }
    
    /**
     * @dev Override _baseURI to return the storage value
     * @return The base URI for token metadata
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Get contract metadata for OpenSea collection info
     * @return Contract-level metadata URI
     */
    function contractURI() external view returns (string memory) {
        return _contractURI;
    }
    
} 