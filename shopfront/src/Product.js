import React, { Component } from 'react'
import ShopfrontContract from '../build/contracts/Shopfront.json'
import AdminContract from '../build/contracts/Admin.json'
import ProductContract from '../build/contracts/Product.json'
import getWeb3 from './utils/getWeb3'

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      price: '',
      stock: ''
    }
  }

  componentWillMount() {
    const contract = require('truffle-contract')
    const Product = contract(ProductContract)
    console.log(this.props);
    Product.setProvider(this.props.web3.currentProvider)

    this.state.product = Product.at(this.props.address);
    return Promise.all([
      this.state.product.id(),
      this.state.product.price(),
      this.state.product.stock()
    ]).then(productData => {
      this.setState({
        id: productData[0],
        price: productData[1].toString(10),
        stock: productData[2].toString(10)
      })
    })
  }

  render() {
    return (
      <tr>
        <td>{this.state.id}</td>
        <td>{this.state.price}</td>
        <td>{this.state.stock}</td>
      </tr>
    )
  }
}

export default Product
