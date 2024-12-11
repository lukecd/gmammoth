// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {GMammoth} from "../src/GMammoth.sol";

contract GMammothScript is Script {
    GMammoth public gMammoth;
    
    // Flame testnet configuration
    uint256 public constant CHAIN_ID = 16604737732183;
    string public constant RPC_URL = "https://rpc.flame.dawn-1.astria.org";

    function setUp() public {
        // Verify we're on the correct network
        require(block.chainid == CHAIN_ID, "Wrong chain ID. Please deploy to Flame testnet.");
    }

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        gMammoth = new GMammoth();
        
        console2.log("GMammoth deployed to:", address(gMammoth));
        console2.log("Verify on https://explorer.flame.dawn-1.astria.org");

        vm.stopBroadcast();
    }

    // This function is for testing purposes only
    function addTestUsers() public {
        // Array of test private keys (1-10)
        uint256[] memory privateKeys = new uint256[](10);
        for (uint i = 0; i < 10; i++) {
            privateKeys[i] = i + 1;
        }

        // Register 10 test users
        for (uint i = 0; i < privateKeys.length; i++) {
            vm.startBroadcast(privateKeys[i]);
            gMammoth.register();
            vm.stopBroadcast();
        }
    }
} 