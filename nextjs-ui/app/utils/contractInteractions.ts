import React from 'react';
import { generatePrivateKey } from 'viem/accounts'
import { getAddress, Address } from 'viem'
import { Bounce, toast } from 'react-toastify';
import { publicClient, walletClient } from '../config/viemConfig'
import { mammothContract } from '../config/contracts'
import { parseAbiItem } from 'viem'
import { ToastMessage } from '../components/ToastMessage';

// Centralized error messages for consistent error handling
export const ERROR_MESSAGES = {
  NOT_REGISTERED: 'Wallet not registered',
  ALREADY_REGISTERED: 'Wallet already registered',
  NETWORK_ERROR: 'Network error occurred',
} as const;

/**
 * Fetches all currently registered wallet addresses from the contract
 * @returns Array of registered wallet addresses
 */
export const getRegisteredWallets = async (): Promise<string[]> => {
  try {
    const registeredWallets = await publicClient.readContract({
      address: mammothContract.address,
      abi: mammothContract.abi,
      functionName: 'getRegisteredUsers',
    }) as string[]
    
    return registeredWallets
  } catch (error) {
    console.error('Error fetching registered wallets:', error)
    return []
  }
} 

/**
 * Displays a toast notification when a new gMammoth message is received
 * @param fromAddress The address that sent the gMammoth
 */
export const handleIncomingMessage = (fromAddress: string) => {
  toast.success(ToastMessage({ fromAddress }), {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    icon: false,
    theme: "dark",
    transition: Bounce
  });
}; 

/**
 * Registers the current wallet address with the gMammoth contract
 * @returns Promise<boolean> indicating success/failure of registration
 */
export const register = async (): Promise<boolean> => {
  try {
    if (!walletClient) throw new Error("Wallet not connected");
    
    const [account] = await walletClient.getAddresses();
    const { request } = await publicClient.simulateContract({
      address: mammothContract.address,
      abi: mammothContract.abi,
      functionName: 'register',
      account,
    })

    const hash = await walletClient.writeContract(request)
    
    // Wait for transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    
    toast.success('Successfully registered!', {
      position: "top-center",
      autoClose: 3000,
    })
    
    return true
  } catch (error) {
    console.error('Registration error:', error)
    toast.error('Failed to register. Please try again.', {
      position: "top-center",
      autoClose: 3000,
    })
    return false
  }
}

export const deregister = async (): Promise<boolean> => {
  try {
    if (!walletClient) throw new Error("Wallet not connected");
    
    const [account] = await walletClient.getAddresses();
    const { request } = await publicClient.simulateContract({
      address: mammothContract.address,
      abi: mammothContract.abi,
      functionName: 'deregister',
      account,
    })

    const hash = await walletClient.writeContract(request)
    
    // Wait for transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    
    toast.success('Successfully deregistered!', {
      position: "top-center",
      autoClose: 3000,
    })
    
    return true
  } catch (error) {
    console.error('Registration error:', error)
    toast.error('Failed to register. Please try again.', {
      position: "top-center",
      autoClose: 3000,
    })
    return false
  }
}

export const isRegistered = async (address: Address): Promise<boolean> => {
  try {
    const registered = await publicClient.readContract({
      address: mammothContract.address,
      abi: mammothContract.abi,
      functionName: 'isRegistered',
      args: [address],
    })
    
    return registered as boolean
  } catch (error) {
    console.error('Error checking registration status:', error)
    return false
  }
}

export const sendGMammoth = async (toAddress: string) => {
    if (!walletClient) throw new Error("Wallet not connected");
    
    const [account] = await walletClient.getAddresses();
    const { request } = await publicClient.simulateContract({
        address: mammothContract.address,
        abi: mammothContract.abi,
        functionName: 'sendGMammoth',
        account,
        args: [toAddress as `0x${string}`]
    });

    const hash = await walletClient.writeContract(request);
    
    // Wait for transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    toast.success('Successfully sent gMammoth!', {
        position: "top-center",
        autoClose: 3000,
    });
    
    return hash;
};

/**
 * Sets up an event listener for incoming gMammoth messages
 * @param userAddress The address to listen for messages to
 * @returns Cleanup function to remove the event listener
 */
export const setupGMammothEventListener = (userAddress: string) => {
  console.log('Setting up GMammoth event listener for', userAddress);
  
  try {
    // Create event listener for GMammothSent events
    const unwatch = publicClient.watchContractEvent({
      address: mammothContract.address,
      abi: mammothContract.abi,
      eventName: 'GMammothSent',
      onLogs: (logs) => {
        console.log('Received logs:', logs);
        try {
          for (const log of logs) {
            // Type assertion for event args
            const { from, to } = log.args as unknown as { from: string; to: string };
            console.log('Log args:', { from, to });
            if (to?.toLowerCase() === userAddress.toLowerCase()) {
              handleIncomingMessage(from);
            }
          }
        } catch (error) {
          console.error('Error processing event log:', error);
        }
      },
    });

    return unwatch;
  } catch (error) {
    console.error('Error setting up event listener:', error);
    return () => {}; // Return empty cleanup function in case of setup error
  }
};

export const setupRegistrationEventListener = (
  callback: () => void
): (() => void) => {
  const unwatch = publicClient.watchContractEvent({
    address: mammothContract.address,
    abi: mammothContract.abi,
    eventName: 'Registration',
    onLogs: () => {
      callback();
    },
  });

  return unwatch;
};

export const setupDeregistrationEventListener = (
  callback: () => void
): (() => void) => {
  const unwatch = publicClient.watchContractEvent({
    address: mammothContract.address,
    abi: mammothContract.abi,
    eventName: 'Deregistration',
    onLogs: () => {
      callback();
    },
  });

  return unwatch;
};

