// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import { default as HookedWeb3Provider } from "hooked-web3-provider";
import { default as EthLightWallet } from "eth-lightwallet";
import { default as Promise} from 'bluebird';


// Import our contract artifacts and turn them into usable abstractions.
import metacoin_artifacts from '../../build/contracts/MetaCoin.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var MetaCoin = contract(metacoin_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    MetaCoin.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refreshBalance();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(account, {from: account});
    }).then(function(value) {
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  sendCoin: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.sendCoin(receiver, amount, {
        from: account,
        gasPrice: web3.eth.gasPrice.toString(10),
        gas:500000
      });
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  if (window.location.href.indexOf("client_sig") > -1) {
    console.log("In client_sig mode");
    const password = prompt('Enter password for keystore encryption', 'password');
    console.log(
        "If you want a different 12-word seed phrase, here is one:",
        EthLightWallet.keystore.generateRandomSeed());
    // For the demo's simplicity sake, we will use:
    const seedPhrase = prompt('Enter seed phrase for key generation', "shadow forest way arrange ladder then lake ethics amazing seminar educate token");

    Promise.promisifyAll(EthLightWallet.keystore, { suffix: "Promise" });
    let keystore;
    EthLightWallet.keystore.createVaultPromise({
              password: password,
              seedPhrase: seedPhrase
          })
          .then(_keystore => {
              keystore = _keystore;
              // Some methods will require providing the `pwDerivedKey`,
              // Allowing you to only decrypt private keys on an as-needed basis.
              // You can generate that value with this convenient method:
              Promise.promisifyAll(keystore, { suffix: "Promise" });
              return keystore.keyFromPasswordPromise(password);
          })
          .then(pwDerivedKey => {
              // generate 1 new address/private key pair
              // the corresponding private key is also encrypted
              keystore.generateNewAddress(pwDerivedKey, 1);
              // Let you know it
              console.log("Your address is", "0x" + keystore.getAddresses()[0], ", make sure you have enough Ether on it");
              // Let's fool the getAccounts function
              web3.eth.getAccounts = callback => callback(undefined, keystore.getAddresses().map(address => "0x" + address));
              // Let's ask for the password whenever needed to avoid theft
              keystore.passwordProvider = callback => callback(null, prompt("Please enter password to sign this transaction", "password"));
              // Now set keystore as transaction_signer in the hooked web3 provider
              const hookedProvider = new HookedWeb3Provider({
                  // Let's pick the one that came with Truffle
                  host: web3.currentProvider.host,
                  transaction_signer: keystore
              });
              web3.setProvider(hookedProvider);
              App.start();
          })
          .catch(console.error);
  } else {
      App.start();
  }
});
