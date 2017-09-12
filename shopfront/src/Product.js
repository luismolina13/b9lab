import React, { Component } from 'react'
import ProductContract from '../build/contracts/Product.json'

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
    Product.setProvider(this.props.web3.currentProvider)

    this.product = Product.at(this.props.address);
    return Promise.all([
      this.product.id(),
      this.product.price(),
      this.product.stock()
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
        <td><button type="button" onClick={() => this.props.buy(this.props.address, this.state.price)}>Buy</button></td>
      </tr>
    )
  }
}

export default Product
