pragma solidity ^0.4.0;

contract Product {
    uint public stock;
    uint public price; // In wei
    string public id;

    event LogStockChanged(uint oldStock, uint newStock);

    function Product(uint _stock, uint _price, string _id) {
        stock = _stock;
        price = _price;
        id = _id;
    }

    function add(uint num) public {
        uint oldStock = stock;
        stock += num;
        LogStockChanged(oldStock, stock);
    }

    function remove() public {
        uint oldStock = stock;
        stock -= 1;
        LogStockChanged(oldStock, stock);
    }
}
