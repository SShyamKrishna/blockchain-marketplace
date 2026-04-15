// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Marketplace {
    uint256 public itemCount = 0;

    struct Item {
        uint256 id;
        string name;
        uint256 price;
        address payable seller;
        address owner;
        bool sold;
    }

    mapping(uint256 => Item) public items;

    event ItemListed(
        uint256 id,
        string name,
        uint256 price,
        address seller
    );

    event ItemPurchased(
        uint256 id,
        address seller,
        address buyer,
        uint256 price
    );

    function listItem(string memory _name, uint256 _price) public {
        require(bytes(_name).length > 0, "Item name cannot be empty");
        require(_price > 0, "Price must be greater than zero");

        itemCount++;

        items[itemCount] = Item(
            itemCount,
            _name,
            _price,
            payable(msg.sender),
            msg.sender,
            false
        );

        emit ItemListed(itemCount, _name, _price, msg.sender);
    }

    function buyItem(uint256 _id) public payable {
        require(_id > 0 && _id <= itemCount, "Item does not exist");

        Item storage item = items[_id];

        require(!item.sold, "Item already sold");
        require(msg.sender != item.seller, "Seller cannot buy own item");
        require(msg.value == item.price, "Incorrect payment amount");

        address payable seller = item.seller;

        item.owner = msg.sender;
        item.sold = true;

        seller.transfer(msg.value);

        emit ItemPurchased(_id, seller, msg.sender, item.price);
    }
}