import React, { Component } from 'react'
import ShopfrontContract from '../build/contracts/Shopfront.json'
import AdminContract from '../build/contracts/Admin.json'
import ProductContract from '../build/contracts/Product.json'
import getWeb3 from './utils/getWeb3'
import Product from './Product'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      accounts: null,
      owner: null,
      products: []
    }

    this.handleIdChange = this.handleIdChange.bind(this);
    this.handlePriceChange = this.handlePriceChange.bind(this);
    this.handleStockChange = this.handleStockChange.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3.then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const shopfront = contract(ShopfrontContract)
    const Admin = contract(AdminContract)
    const Product = contract(ProductContract)
    shopfront.setProvider(this.state.web3.currentProvider)
    Admin.setProvider(this.state.web3.currentProvider)
    Product.setProvider(this.state.web3.currentProvider)

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      shopfront.deployed().then((instance) => {
        this.shopfront = instance
        this.admin = Admin.at(instance.address);
        this.accounts = accounts
        console.log(this.shopfront);
        // console.log(this.admin);
        return this.shopfront.getProductsCount();
      }).then((count) => {
        console.log(parseInt(count))
        return Promise.all(Array.from(Array(parseInt(count)).keys()).map(x => this.shopfront.getProduct(x)));
      }).then((products) => {
        console.log(products);
        this.setState({products: products});
      }).then(() => {
        return this.admin.owner.call({from: this.accounts[0]})
      }).then((owner) => {
        // Get the value from the contract to prove it worked.
        console.log(owner);
        return this.setState({owner: owner});
      })
    })
  }

  addProduct() {
    if(parseInt(this.state.price) > 0 && parseInt(this.state.stock) > 0) {
      this.shopfront.addProduct(this.state.stock, this.state.price, this.state.id,
        {from: this.accounts[0], gas: 4000000})
      .then(function(txn) {
        console.log(txn)
      });
    } else {
      alert('Integers over Zero, please');
    }
  }

  buyProduct(address, price) {
    console.log("Product Address:", address, "Product price:", parseInt(price));
    this.shopfront.buyProduct(address, {
      from: this.accounts[0],
      value: parseInt(price),
      gas: 4000000
    }).then(function(txn) {
      console.log(txn);
    })
  }

  handleStockChange(e) {
    this.setState({stock: e.target.value});
  }

  handleIdChange(e) {
    this.setState({id: e.target.value});
  }

  handlePriceChange(e) {
    this.setState({price: e.target.value});
  }

  render() {
    const products = this.state.products.map((address) => {
      return (
        <Product
          key={address}
          address={address}
          web3={this.state.web3}
          buy={(address, price) => this.buyProduct(address, price)}
        />
      );
    });

    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Shop Front</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Shopfront</h1>
              <p>The owner of the Shopfront is: {this.state.owner}</p>
              <form>
                <input type="text" name="id" placeholder="id" value={this.state.id} onChange={this.handleIdChange} />
                <input type="text" name="price" placeholder="price" value={this.state.price} onChange={this.handlePriceChange} />
                <input type="text" name="stock" placeholder="stock" value={this.state.stock} onChange={this.handleStockChange} />
                <button type="button" onClick={() => this.addProduct()}>Add Product</button>
              </form>
              <br/>
              <table>
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Id</th>
                    <th>Price (Wei)</th>
                    <th>Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
