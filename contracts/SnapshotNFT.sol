// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "lib/openzeppelin-contracts/contracts/utils/Strings.sol";
import "./Utils/ReentrancyGuard.sol";

// Forward declaration for interface calls
interface ISeedFactory {
    function seedSnapshotPrices(uint256 seedId) external view returns (uint256);
}

/**
 * @title SnapshotNFT
 * @dev Single ERC721 contract for all snapshots across all seeds
 * Each snapshot records the seed ID, beneficiary index, timestamp, and block number
 * Beneficiary indices must correspond to valid beneficiaries in the Distributor
 */
contract SnapshotNFT is ERC721Enumerable, Ownable, ReentrancyGuard {
    

    // Core contract addresses
    address public factory;
    
    // Metadata
    string private _baseTokenURI;
    string private _contractURI;
    
    // Token ID tracking
    uint256 private _nextSnapshotId = 1;
    
    // Snapshot metadata
    struct SnapshotData {
        address creator;          
        uint80 value;             
        uint16 beneficiaryIndex; 
        uint32 seedId;             
        uint32 timestamp;          
        uint32 blockNumber;      
        uint32 positionInSeed;    
        string processId;     
    }
    
    // Mapping from snapshot ID to snapshot data
    mapping(uint256 => SnapshotData) public snapshots;
    // Mapping from seed ID to array of snapshot IDs
    mapping(uint256 => uint256[]) public seedSnapshots;
    // Mapping from beneficiary index to array of snapshot IDs
    mapping(uint256 => uint256[]) public beneficiarySnapshots;
    // Value tracking
    mapping(uint256 => uint256) public beneficiaryTotalValue;
    uint256 private _totalValueRaised;


    event SnapshotMinted(
        uint256 indexed seedId,          // e.g., 45
        uint256 indexed snapshotId,      // e.g., 123
        string indexed beneficiaryCode,  // "06-PIM" 
        uint256 beneficiaryDistribution, // e.g., 1250 (12.5%) 
        address creator,                 // 0xabc...
        uint256 timestamp,              // 1734567890
        uint256 blockNumber,            // 19123456
        string processId                 // ProcessID
    );
    event BaseURISet(string baseURI);
    event ContractURISet(string contractURI);
    
   
    /**
     * @dev Constructor to initialize the snapshot NFT collection
     * @param _initialOwner The initial owner (factory contract)
     */
    constructor(address _initialOwner) ERC721("Way of Flowers Snapshots", "SNAPS") Ownable(_initialOwner) {
        require(_initialOwner != address(0), "SnapshotNFT: Invalid initial owner");
        _baseTokenURI = "";
        _contractURI = "";
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set the SnapFactory contract address (only owner)
     * @param _factory Address of the SnapFactory contract
     */
    function setFactory(address _factory) external onlyOwner {
        require(_factory != address(0), "SnapshotNFT: Invalid factory");
        factory = _factory;
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
     * @dev Get the current base URI
     * @return The current base URI
     */
    function getBaseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    // ============ CORE FUNCTIONS ============

    /**
     * @dev Get snapshot IDs for a given user's wallet address
     * @param user The user address to get snapshots for
     * @return Array of snapshot token IDs owned by the user
     */
    function getUserSnapshots(address user) external view returns (uint256[] memory) {
        uint256 userBalance = balanceOf(user);
        uint256[] memory snapshotIds = new uint256[](userBalance);
        
        // Use the built-in enumerable function
        for (uint256 i = 0; i < userBalance; i++) {
            snapshotIds[i] = tokenOfOwnerByIndex(user, i);
        }
        return snapshotIds;
    }
    
    /**
     * @dev Get the effective snapshot price for a specific seed NFT
     * @param seedId The ID of the seed NFT
     * @return The effective snapshot price for this seed
     */
    function getSeedSnapshotPrice(uint256 seedId) external view returns (uint256) {
        require(factory != address(0), "SnapshotNFT: Factory not set");
        uint256 price = ISeedFactory(factory).seedSnapshotPrices(seedId);
        return price;
    }

    /**
     * @dev Mint a snapshot NFT (internal function - only called by SnapFactory)
     * @param seedId The ID of the seed NFT
     * @param beneficiaryIndex The index of the beneficiary
     * @param processId The process ID
     * @param to The address to mint the snapshot to
     * @param value The value associated with this snapshot
     * @param projectCode The project code from SnapFactory 
     * @return snapshotId The ID of the newly minted snapshot
     */
    function mintSnapshot(
        uint256 seedId,
        uint256 beneficiaryIndex,
        string calldata processId,
        address to,
        uint256 value,
        string calldata projectCode
    ) external nonReentrant returns (uint256) {
        require(msg.sender == factory, "SnapshotNFT: Only factory can call");
        require(to != address(0), "SnapshotNFT: Invalid recipient");

        uint256 snapshotId = _nextSnapshotId;
        unchecked {
            _nextSnapshotId++;
        }

        snapshots[snapshotId] = SnapshotData({
            creator: to,
            value: uint80(value),
            beneficiaryIndex: uint16(beneficiaryIndex),
            seedId: uint32(seedId),
            timestamp: uint32(block.timestamp),  
            blockNumber: uint32(block.number), 
            positionInSeed: 0, // Will be set below after adding to seedSnapshots
            processId: processId
        });

        seedSnapshots[seedId].push(snapshotId);
        beneficiarySnapshots[beneficiaryIndex].push(snapshotId);
        beneficiaryTotalValue[beneficiaryIndex] += value;
        _totalValueRaised += value;

        unchecked {
            snapshots[snapshotId].positionInSeed = uint32(seedSnapshots[seedId].length);
        }

        // Mint NFT
        _mint(to, snapshotId);

        uint256 distributionPercentage;
        unchecked {
            // Calculate percentage based on value raised, not snapshot count
            distributionPercentage = _totalValueRaised > 0 ?
                (beneficiaryTotalValue[beneficiaryIndex] * 10000) / _totalValueRaised : 10000;
        }

        emit SnapshotMinted(
            seedId,                   
            snapshotId,       
            projectCode,              
            distributionPercentage,
            to,
            block.timestamp,        
            block.number,           
            processId
        );

        return snapshotId;
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get snapshot data
     * @param snapshotId The snapshot token ID
     * @return snapshotData The complete snapshot data
     */
    function getSnapshotData(uint256 snapshotId) external view returns (SnapshotData memory snapshotData) {
        require(_exists(snapshotId), "SnapshotNFT: Snapshot does not exist");
        return snapshots[snapshotId];
    }
    
    /**
     * @dev Get all snapshot IDs for a specific seed
     * @param seedId The seed ID
     * @return Array of snapshot token IDs
     */
    function getSeedSnapshots(uint256 seedId) external view returns (uint256[] memory) {
        return seedSnapshots[seedId];
    }
    
    /**
     * @dev Get all snapshot IDs for a specific beneficiary
     * @param beneficiaryIndex The beneficiary index
     * @return Array of snapshot token IDs
     */
    function getBeneficiarySnapshots(uint256 beneficiaryIndex) external view returns (uint256[] memory) {
        return beneficiarySnapshots[beneficiaryIndex];
    }
    
    /**
     * @dev Get snapshot count for a specific seed
     * @param seedId The seed ID
     * @return The number of snapshots for this seed
     */
    function getSeedSnapshotCount(uint256 seedId) external view returns (uint256) {
        return seedSnapshots[seedId].length;
    }
    
    /**
     * @dev Get snapshot count for a specific beneficiary
     * @param beneficiaryIndex The beneficiary index
     * @return The number of snapshots for this beneficiary
     */
    function getBeneficiarySnapshotCount(uint256 beneficiaryIndex) external view returns (uint256) {
        return beneficiarySnapshots[beneficiaryIndex].length;
    }

    /**
     * @dev Get the total value raised by a beneficiary from all their snapshots
     * @param beneficiaryIndex The beneficiary index
     * @return The total value raised by this beneficiary in wei
     */
    function getBeneficiaryTotalValue(uint256 beneficiaryIndex) external view returns (uint256) {
        return beneficiaryTotalValue[beneficiaryIndex];
    }

    /**
     * @dev Get the total value raised across all snapshots in the system
     * @return The total value raised in wei (sum of all beneficiaryTotalValue)
     */
    function getTotalValueRaised() external view returns (uint256) {
        return _totalValueRaised;
    }

    /**
     * @dev Get the next snapshot ID that will be minted
     * @return The next snapshot ID
     */
    function getNextSnapshotId() external view returns (uint256) {
        return _nextSnapshotId;
    }
    
    function getLatestSnapshotId(uint256 seedId) public view returns (uint256) {
        require(seedSnapshots[seedId].length > 0, "Seed has no snapshots");
        return seedSnapshots[seedId][seedSnapshots[seedId].length - 1];
    }

    /**
     * @dev Get the total number of snapshots minted
     * @return The total snapshot count
     */
    function getTotalSnapshots() external view returns (uint256) {
        return _nextSnapshotId - 1;
    }
    
    /**
     * @dev Get snapshot ID by index (for enumeration)
     * @param index The index of the snapshot (0-based)
     * @return The snapshot ID at the given index
     */
    function getSnapshotByIndex(uint256 index) external view returns (uint256) {
        require(index < totalSupply(), "SnapshotNFT: Index out of bounds");
        return tokenByIndex(index);
    }
    
    /**
     * @dev Get the position of a snapshot within its seed
     * @param snapshotId The snapshot ID
     * @return The position of the snapshot within its seed (1-based indexing)
     */
    function getSnapshotPositionInSeed(uint256 snapshotId) external view returns (uint256) {
        require(_exists(snapshotId), "SnapshotNFT: Snapshot does not exist");
        return snapshots[snapshotId].positionInSeed;
    }
    
    // ============ INTERNAL FUNCTIONS ============

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
    
    function seedURI(uint256 seedId) public view returns (string memory) {
        require(seedSnapshots[seedId].length > 0, "Seed has no snapshots");
        return tokenURI(getLatestSnapshotId(seedId));
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
     * @dev Override tokenURI to provide snapshot-specific metadata
     * @param tokenId The token ID
     * @return The token URI (JSON metadata)
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "SnapshotNFT: URI query for nonexistent token");
        return _buildSnapshotMetadata(tokenId);
    }

        /**
     * @dev Build JSON metadata for a snapshot NFT
     * @param snapshotId The snapshot token ID
     * @return JSON metadata string
     */
    function _buildSnapshotMetadata(uint256 snapshotId) internal view returns (string memory) {
        SnapshotData memory data = snapshots[snapshotId];
        string memory baseURI = _baseURI();

        // Build image URL
        string memory imageUrl;
        if (bytes(baseURI).length > 0) {
            imageUrl = string(abi.encodePacked(
                baseURI,
                "seed", Strings.toString(data.seedId),
                "/snap", Strings.toString(data.seedId),
                "-", Strings.toString(snapshots[snapshotId].positionInSeed),
                "-", data.processId,
                ".png"
            ));
        }

        // Get beneficiary info
        string memory beneficiaryName = _getBeneficiaryName(data.beneficiaryIndex); 

        // Build simple JSON metadata to avoid stack overflow
        return string(abi.encodePacked(
            '{"name":"Way of Flowers Snapshot #', Strings.toString(snapshotId),
            '","description":"Snapshot from Seed #', Strings.toString(data.seedId),
            ' by ', beneficiaryName,
            '","image":"', imageUrl,
            '","attributes":[',
            '{"trait_type":"Seed ID","value":"', Strings.toString(data.seedId), '"},',
            '{"trait_type":"Beneficiary","value":"', beneficiaryName, '"},',
            '{"trait_type":"Process ID","value":"', data.processId, '"}',
            ']}'
        ));
    }

    /**
     * @dev Get beneficiary name for metadata (simplified fallback)
     * @param beneficiaryIndex The beneficiary index
     * @return Beneficiary name or fallback
     */
    function _getBeneficiaryName(uint256 beneficiaryIndex) internal pure returns (string memory) {
        // Simple fallback since SnapshotNFT no longer has direct distributor access
        return string(abi.encodePacked("Beneficiary #", Strings.toString(beneficiaryIndex)));
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
    
    /**
     * @dev Set the contract URI for OpenSea collection metadata (only owner)
     * @param newContractURI The new contract URI
     */
    function setContractURI(string memory newContractURI) external onlyOwner {
        _contractURI = newContractURI;
        emit ContractURISet(newContractURI);
    }
} 