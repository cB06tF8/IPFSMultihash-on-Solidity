// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; 

/**
 * @title IPFSStorage
 * @author originally written by Forest Fang (@saurfang) - modified by Chris Ball
 * original: https://github.com/saurfang/ipfs-multihash-on-solidity
 * @dev Stores IPFS (multihash) hash by index (original was by address)  
 * A multihash entry is in the format of 
 * <varint hash function code><varint digest size in bytes><hash function output>
 * See https://github.com/multiformats/multihash
 *
 * Currently IPFS hash is 34 bytes long with first two segments represented as a single byte (uint8)
 * The digest is 32 bytes long and can be stored using bytes32 efficiently.
 */
contract IPFSStorage {
  /** @dev matches IPFS Multihash layout mentioned in comments at top */
  struct Multihash {
    bytes32 digest;
    uint8 hashFunction;
    uint8 size;
  }

  mapping (uint => Multihash) private entries; /** @dev nftIndex => IPFS addr hash content */
  uint private numberOfMultihashes; /** @dev total number of IPFS address hash entries */

  event EntrySet (uint indexed key, bytes32 digest, uint8 hashFunction, uint8 size);  
  /** 
    * @dev for this implmentation which stores a mapping by nftIndex, we're not allowing entries
    * to be deleted from the system because NFTs will never be deleted, only added to. 
  event EntryDeleted (uint indexed key);
  */

  /**
   * @dev associate a multihash entry with an NFT index. The index can be used across contracts
   * @param _nftIndex index is used as a key across contracts
   * @param _digest hash digest produced by hashing content using hash function
   * @param _hashFunction hashFunction code for the hash function used
   * @param _size length of the digest 
   */
  function setEntry(uint _nftIndex, bytes32 _digest, uint8 _hashFunction, uint8 _size) public {
    /** 
      * @dev IMP: the incoming IPFS address could actually point to the same address as another 
      * _nftIndex is pointing to. This may or may not be wanted in the final version. Also, I
      * wonder if it's possible to have an 'index' of sorts for doing quick searches on the 
      * _digest as a tool to quickly accomplish this? That may need to be offchain (js, etc). 
    */
    (Multihash storage entry) = (entries[_nftIndex]);
    entry.digest = _digest;
    entry.hashFunction = _hashFunction;
    entry.size = _size;
    numberOfMultihashes++;    
    emit EntrySet(_nftIndex, _digest, _hashFunction, _size);
  }

  /**
   * @dev retrieve multihash entry associated with an nftIndex
   * @param _nftIndex used as key
   */
  function getEntry(uint _nftIndex) public view returns(bytes32 digest, uint8 hashfunction, uint8 size) {
    (Multihash storage entry) = (entries[_nftIndex]);
    return (entry.digest, entry.hashFunction, entry.size);
  }

  /**
    * @dev returns the current number of IPFS hash entries in the system
  */
  function numberOfEntries() public view returns(uint numOfEntries) {
    return numberOfMultihashes;
  }

  /** 
    * @dev for this implmentation, which stores a mapping by _nftIndex, we're not allowing entries
    * to be deleted because the _nfts will not be deleted, only added to.
    * 
    * @dev deassociate any multihash entry with the sender address
  function clearEntry(uint _nftIndex) public {
    require(entries[_nftIndex].digest != 0);
    delete entries[_nftIndex];
    emit EntryDeleted(_nftIndex);
  }
  */
}