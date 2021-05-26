// adapted from https://github.com/saurfang/ipfs-multihash-on-solidity

const BN = web3.utils.BN;
const chai = require("./SetupChai.js");
const expect = chai.expect;

const multiHash = require("../util/multihash.js");
const getBytes32FromMultihash = multiHash.getBytes32FromMultihash;
const getMultihashFromContractResponse = multiHash.getMultihashFromContractResponse;

const eventHelper = require("./expectEvent.js");
const IPFSStorage = artifacts.require('./IPFSStorage.sol');

contract('IPFSStorage', (accounts) => {
  let ipfsStorage;

  beforeEach(async () => {
    ipfsStorage = await IPFSStorage.new();
  });

  // baseURL: https://ipfs.infura.io/ipfs/
  const ipfsHashes = [
    'QmSr8fFpgMm4x9mFB3NTyctKjfHLpKpzUkKCxNXrisfu9e', //monty python: eat the minstrels wav
    'QmfZRqqYyGCZsKi1rg7ZBioiyU8e499nGibezUFstZZQr2', //monty python: herring wav
  ];

  var currentNFTIndex;
  async function setIPFSHash(nftIndex, hash) {
    const { digest, hashFunction, size } = getBytes32FromMultihash(hash);
    return ipfsStorage.setEntry(nftIndex, digest, hashFunction, size, { from: accounts[0] });    
  }

  async function getIPFSHash(nftIndex) {
    /** @dev return vals array: bytes32 digest, uint8 hashfunction, uint8 size  */
    var returnVals = await ipfsStorage.getEntry(nftIndex);    
    return await getMultihashFromContractResponse(returnVals);
  }

  it('should get IPFS hash after setting it', async () => {
    currentNFTIndex = new BN(0);
    await setIPFSHash(currentNFTIndex, ipfsHashes[0]);
    expect(await getIPFSHash(currentNFTIndex)).to.equal(ipfsHashes[0]);
  });

  it('should fire event when new has is set', async () => {
    currentNFTIndex = new BN(0);
    await eventHelper.inTransaction(
      setIPFSHash(currentNFTIndex, ipfsHashes[0]),
      'EntrySet',
    );
  });

  it('should set IPFS hash for each address', async () => {
    currentNFTIndex = new BN(0);
    await setIPFSHash(currentNFTIndex, ipfsHashes[0]);
    currentNFTIndex = new BN(1);
    await setIPFSHash(currentNFTIndex, ipfsHashes[1]);

    currentNFTIndex = new BN(0);
    expect(getIPFSHash(currentNFTIndex)).to.eventually.be.equal(ipfsHashes[0]);
    currentNFTIndex = new BN(1);
    expect(getIPFSHash(currentNFTIndex)).to.eventually.be.equal(ipfsHashes[1]);    
    
    /** @dev if you want to see the entire IPFS address:
    var show = await getIPFSHash(currentNFTIndex);
    console.log('full IPFS address: ' + show);
    */

    expect(ipfsStorage.numberOfEntries()).to.eventually.be.a.bignumber.equal(new BN(2));    
  });

  /** @dev for this implementation (adding IPFS addresses of NFTs), we are not allowing 
    * deletion/clearing of entries from the contract.
  it('should clear IPFS hash after set', async () => {
    await setIPFSHash(accounts[0], ipfsHashes[0]);
    expect(getIPFSHash(accounts[0])).to.eventually.be.equal(ipfsHashes[0]);

    await ipfsStorage.clearEntry();
    expect(await getIPFSHash(accounts[0])).to.be.a('null');
  });

  it('should fire event when entry is cleared', async () => {
    await setIPFSHash(accounts[0], ipfsHashes[0]);

    await expectEvent(
      ipfsStorage.clearEntry(),
      'EntryDeleted',
    );
  });

  it('should prevent clearing non-exists entry', async () => {
    await assertRevert(ipfsStorage.clearEntry());
  });
  */
});
