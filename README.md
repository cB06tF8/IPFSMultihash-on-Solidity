# IPFSMultihash-on-Solidity
 IPFSMultihash-on-Solidity for tracking NFT multihash addresses and information
 
This project has been modified from the original version found at: https://github.com/saurfang/ipfs-multihash-on-solidity

It's been updated deal with newer js and Solidity syntaxes and to store the multihashes in a mapping whose key is an index, as opposed to the original idea which mapped the multihashes to addresses. The index will be useful in real-world situations where an NFT, which has an index, can be tied to a piece of digital content stored on IPFS. Much of the original README contains alot of relevant information and so I've left it mostly untouched below.

## Original ReadMe (with slight modifications)
Example of using Solidity and web3.js to store and retrieve IPFS hash and more generally multihash.

IPFS hash is often represented using 46 character long Base58 encoding(e.g. QmahqCsAUAw7zMv6P6Ae8PjCTck7taQA6FgGQLnWdKG7U8). It might be attempting to store IPFS hash using bytes or string which are dynamically sized byte array since it cannot fit in the largest fixed-size byte arrays bytes32.

However this can be both expensive and challenging to use IPFS hashes in arrays. Luckily as one might notice that IPFS hashes commonly start with Qm, they in fact follow the multihash self describing hash format:

 <varint hash function code><varint digest size in bytes><hash function output>
This makes it possible to break down IPFS hash into a struct like so:

  struct Multihash {
    bytes32 digest;
    uint8 hashFunction;
    uint8 size;
  }
This repository gives an end-to-end example on how to store IPFS hash in Solidity as well as how to call the smart contract using web3.js to get and set IPFS hash.

IPFSStorage.sol is a smart contract that stores IPFS hash in a mapping from an index to the Multihash struct. Because web3.js ABI doesn't support passing tuple as parameter and return type, additional care is taken to normalize the function interface to be web3.js friendly.

multihash.js (see "util" directory) contains the Javascript code that converts base58 encoded multihash string to and from smart contract friendly arguments and responses.

Refer to test cases for additional example code how to interact with the contract.

Reference
Multihash Format: https://github.com/multiformats/multihash
