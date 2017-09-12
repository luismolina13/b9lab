pragma solidity ^0.4.0;

import "./Admin.sol";
import "./Product.sol";

contract Shopfront is Admin {
    address[] public products;
    address[] public productOwners;

    // Tursted products = true
    mapping(address => bool) public trustedProducts;

    // User address to list of product addresses
    mapping(address => address[]) public productsOwned;

    event LogProductAdded(uint stock, uint price, string id, address product);
    event LogProductBought(address product, address buyer, uint price, uint paid);

    function Shopfront() {
        owner = msg.sender;
    }

    function getProductsCount() public constant returns(uint) {
      return products.length;
    }

    function getProduct(uint index) public constant returns(address) {
      return products[index];
    }

    function addProduct(uint stock, uint price, string id) public isAdmin {
        require(msg.sender == owner);

        Product product = new Product(stock, price, id);
        products.push(product);
        trustedProducts[product] = true;

        LogProductAdded(stock, price, id, product);
    }

    function buyProduct(address productAddress) public payable {
        require(msg.value > 0);
        require(trustedProducts[productAddress]);
        Product product = Product(productAddress);
        uint price = product.price();
        require(msg.value >= price);

        product.remove();
        productsOwned[msg.sender].push(product);
        productOwners.push(msg.sender);
        LogProductBought(product, msg.sender, price, msg.value);
    }
}
