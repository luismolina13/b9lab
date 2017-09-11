pragma solidity ^0.4.0;

import "./Admin.sol";
import "./Product.sol";

contract Shopfront is Admin {
    Product[] products;
    mapping(string => Product) productsMap;
    mapping(address => Product[]) productsOwned;

    event LogProductAdded(uint stock, uint price, string id);
    event LogProductBought(string id, address buyer);

    function Shopfront() {
        owner = msg.sender;
    }

    function addProduct(uint stock, uint price, string id) public isAdmin {
        require(msg.sender == owner);

        Product product = new Product(stock, price, id);
        products.push(product);

        LogProductAdded(stock, price, id);
    }

    function buyProduct(string id) public payable {
        require(msg.value > 0);
        Product product = productsMap[id];
        require(msg.value > product.price());

        product.remove();
        productsOwned[msg.sender].push(product);
        LogProductBought(id, msg.sender);
    }
}
