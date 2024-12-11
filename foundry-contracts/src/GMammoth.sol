// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract GMammoth {
    // Mapping to track registered users
    mapping(address => bool) public registeredUsers;
    // Array to keep track of all registered addresses
    address[] public userList;

    // Events
    event UserRegistered(address indexed user);
    event UserDeregistered(address indexed user);
    event GMammothSent(
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    // Register a user
    function register() public {
        require(!registeredUsers[msg.sender], "User already registered");
        registeredUsers[msg.sender] = true;
        userList.push(msg.sender);
        emit UserRegistered(msg.sender);
    }

    // Deregister a user
    function deregister() public {
        require(registeredUsers[msg.sender], "User not registered");
        
        // Remove user from userList
        for (uint i = 0; i < userList.length; i++) {
            if (userList[i] == msg.sender) {
                // Move the last element to the current position
                userList[i] = userList[userList.length - 1];
                userList.pop();
                // Set registered status to false AFTER array manipulation
                registeredUsers[msg.sender] = false;
                emit UserDeregistered(msg.sender);
                return;
            }
        }
        
        // If we reach here, something went wrong
        revert("User not found in list");
    }

    // Get all registered users
    function getRegisteredUsers() public view returns (address[] memory) {
        return userList;
    }

    // Send a gMammoth message
    function sendGMammoth(address to) public {
        require(registeredUsers[msg.sender], "Sender not registered");
        require(registeredUsers[to], "Recipient not registered");
        
        emit GMammothSent(msg.sender, to, block.timestamp);
    }

    // Check if an address is registered
    function isRegistered(address user) public view returns (bool) {
        return registeredUsers[user];
    }
} 