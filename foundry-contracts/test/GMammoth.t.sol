// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console2} from "forge-std/Test.sol";
import {GMammoth} from "../src/GMammoth.sol";

contract GMammothTest is Test {
    GMammoth public gMammoth;
    address public user1;
    address public user2;

    function setUp() public {
        gMammoth = new GMammoth();
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
    }

    function test_Registration() public {
        vm.prank(user1);
        gMammoth.register();
        assertTrue(gMammoth.isRegistered(user1));
    }

    function test_DoubleRegistrationFails() public {
        vm.startPrank(user1);
        gMammoth.register();
        vm.expectRevert("User already registered");
        gMammoth.register();
        vm.stopPrank();
    }

    function test_Deregistration() public {
        vm.startPrank(user1);
        gMammoth.register();
        vm.stopPrank();

        vm.startPrank(user2);
        gMammoth.register();
        vm.stopPrank();

        vm.startPrank(user1);
        gMammoth.deregister();
        assertFalse(gMammoth.isRegistered(user1));
        vm.stopPrank();
    }

    function test_DeregistrationFailsIfNotRegistered() public {
        vm.prank(user1);
        vm.expectRevert("User not registered");
        gMammoth.deregister();
    }

    function test_GetRegisteredUsers() public {
        vm.prank(user1);
        gMammoth.register();
        vm.prank(user2);
        gMammoth.register();

        address[] memory users = gMammoth.getRegisteredUsers();
        assertEq(users.length, 2);
        assertEq(users[0], user1);
        assertEq(users[1], user2);
    }

    function test_SendGMammoth() public {
        // Register both users
        vm.prank(user1);
        gMammoth.register();
        vm.prank(user2);
        gMammoth.register();

        // Send gMammoth and verify event
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit GMammoth.GMammothSent(user1, user2, block.timestamp);
        gMammoth.sendGMammoth(user2);
    }

    function test_SendGMammothFailsIfSenderNotRegistered() public {
        vm.prank(user2);
        gMammoth.register();

        vm.prank(user1);
        vm.expectRevert("Sender not registered");
        gMammoth.sendGMammoth(user2);
    }

    function test_SendGMammothFailsIfRecipientNotRegistered() public {
        vm.prank(user1);
        gMammoth.register();

        vm.prank(user1);
        vm.expectRevert("Recipient not registered");
        gMammoth.sendGMammoth(user2);
    }
} 