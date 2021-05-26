import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import IPFSStorage from './abis/IPFSStorage.json';

// copied multihash.js (exists in ../../util as well)
const multiHash = require("./multihash.js");
const getBytes32FromMultihash = multiHash.getBytes32FromMultihash;
const getMultihashFromContractResponse = multiHash.getMultihashFromContractResponse;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      contract: null,
      numberOfEntries: 0,
      ipfsHashes: [],
      returnedIPFSHashes: []
    }
  }

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockChainData();
  }

  /** @dev function handles loading of the blockchain data */
  async loadBlockChainData() {
    
    /** @dev accounts */
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    /** @dev retrieve the smart contract */
    const networkId =  await web3.eth.net.getId();
    const networkData = IPFSStorage.networks[networkId]; // = null; will trigger error handling
    if (networkData) {
      const contractAbi = IPFSStorage.abi;
      const contractAddr = networkData.address;
      const contract = new web3.eth.Contract(contractAbi, contractAddr);
      const numberOfEntries = await contract.methods.numberOfEntries().call();

      this.setState( { contract, numberOfEntries });
      
      /** @dev load existing IPFS addresses */
      for (var i= 0; i < numberOfEntries - 1; i++) {
        var ipfsHash = await contract.methods.getEntry(i).call();      
        this.setState({
          /** @dev this syntax is using the E6 spread operator. note not only the ..., but that 
           *  there is no semicolon after */
          colors: [...this.state.ipfsHashes, ipfsHash]
        })      
      }
    } else {
      window.alert('The smart contract is not deployed on the detected network. Unable to continue...');
    }
  }

  /** @dev taken from metamask instructions */
  async loadWeb3() {    
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(Window.web3.currentProvider);
    } else {
      window.alert('Non-Ethereum browser detected. Please use MetaMask.');
    }
  }

  retrieveHash = (nftIndex) => {
    var returnVals = this.state.contract.methods.getEntry(nftIndex);    
    var ipfsHash = getMultihashFromContractResponse(returnVals);
  }

  retrieveTotalEntries = () => {
    var numEntries = this.state.contract.methods.numberOfEntries().send({ from: this.state.account });
    this.setState({ numberOfEntries: numEntries });
  }
  /** @dev setEntry function wrapper */
  addIPFSHash = (ipfsHash) => {
    var { digest, hashFunction, size } = getBytes32FromMultihash(ipfsHash);
    var nextIndex = this.state.numberOfEntries + 1;
    //console.log('ipfsHash: ' + ipfsHash);
    this.state.contract.methods.setEntry(nextIndex, digest, hashFunction, size).send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.setState({
          colors: [...this.state.ipfsHashes, ipfsHash],
        })
      });
  }  

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-1 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Test Storing IPFS Multihashes on Solidity
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-white">
                <span id='account'>current acct: {this.state.account}</span>
              </small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row text-center">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className='content mx-auto'>
                <h2>Enter an IPFS Multihash Address</h2>
                <form onSubmit={(event) =>{
                  event.preventDefault();
                  const ipfsHash = this.ipfsHash.value;
                  this.addIPFSHash(ipfsHash);
                }}>
                  <input  
                    type='text'
                    className='form-control mb-1'
                    placeholder='e.g QmSr8fFpgMm4x9mFB3NTyctKjfHLpKpzUkKCxNXrisfu9e'
                    ref={(input) => { this.ipfsHash = input }}
                  />
                  <input 
                    type='submit'
                    className='btn btn-block btn-primary'
                    value='Add a Multihash'
                  />
                </form>                
              </div>
            </main>
          </div>
          <hr />
          <div className="row text-center">
            { this.state.ipfsHashes.map((ipfsHash, key) => {
              return (
                <div key={key}>                  
                  <div>Address: {ipfsHash}</div>
                </div>
              )
            })} 
          </div>           
        </div>
      </div>
    );
  }
}

export default App;
