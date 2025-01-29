import { Address } from 'viem'
import { Bounce, toast } from 'react-toastify';
import { publicClient, walletClient } from '../config/viemConfig'
import { mammothContract } from '../config/contracts'
import { ToastMessage } from '../components/ToastMessage';

// Add these error types at the top of the file
type ContractError = {
  name: string;
  message: string;
  shortMessage?: string;
  code?: string;
  cause?: unknown;
}

type WalletError = {
  code: number;
  message: string;
  shortMessage?: string;
}

// Centralized error messages for consistent error handling
export const ERROR_MESSAGES = {
  NOT_REGISTERED: 'Wallet not registered',
  ALREADY_REGISTERED: 'Wallet already registered',
  NETWORK_ERROR: 'Network error occurred',
  WALLET_NOT_CONNECTED: 'Wallet not connected',
  USER_REJECTED: 'Transaction rejected by user',
  SIMULATION_FAILED: 'Transaction simulation failed',
  UNKNOWN_ERROR: 'An unknown error occurred',
  INVALID_ADDRESS: 'Invalid wallet address',
  TRANSACTION_FAILED: 'Transaction failed to complete',
  RPC_ERROR: 'Network connection error',
} as const;

// Helper function to handle contract errors
const handleContractError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const contractError = error as ContractError;
    
    // Check for user rejection
    if (contractError.code === 'ACTION_REJECTED' || 
        contractError.message?.includes('rejected')) {
      return ERROR_MESSAGES.USER_REJECTED;
    }
    
    // Check for simulation failures
    if (contractError.message?.includes('simulation failed')) {
      return ERROR_MESSAGES.SIMULATION_FAILED;
    }

    // Return the short message if available
    if (contractError.shortMessage) {
      return contractError.shortMessage;
    }
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

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
    const errorMessage = handleContractError(error);
    console.error('Error fetching registered wallets:', {
      error,
      message: errorMessage
    });
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
    if (!walletClient) throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    
    const [account] = await walletClient.getAddresses();
    const { request } = await publicClient.simulateContract({
      address: mammothContract.address,
      abi: mammothContract.abi,
      functionName: 'register',
      account,
    })

    const hash = await walletClient.writeContract(request)
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    
    toast.success('Successfully registered!', {
      position: "top-center",
      autoClose: 3000,
    })
    
    return true
  } catch (error) {
    const errorMessage = handleContractError(error);
    console.error('Registration error:', error);
    toast.error(errorMessage, {
      position: "top-center",
      autoClose: 3000,
    })
    return false
  }
}

export const deregister = async (): Promise<boolean> => {
  try {
    if (!walletClient) throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
    
    const [account] = await walletClient.getAddresses();
    const { request } = await publicClient.simulateContract({
      address: mammothContract.address,
      abi: mammothContract.abi,
      functionName: 'deregister',
      account,
    })

    const hash = await walletClient.writeContract(request)
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    
    toast.success('Successfully deregistered!', {
      position: "top-center",
      autoClose: 3000,
    })
    
    return true
  } catch (error) {
    const errorMessage = handleContractError(error);
    console.error('Deregistration error:', error);
    toast.error(errorMessage, {
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
    const errorMessage = handleContractError(error);
    console.error('Error checking registration status:', {
      error,
      message: errorMessage,
      address
    });
    return false
  }
}

export const sendGMammoth = async (toAddress: string) => {
    try {
        if (!walletClient) throw new Error(ERROR_MESSAGES.WALLET_NOT_CONNECTED);
        
        const [account] = await walletClient.getAddresses();
        const { request } = await publicClient.simulateContract({
            address: mammothContract.address,
            abi: mammothContract.abi,
            functionName: 'sendGMammoth',
            account,
            args: [toAddress as `0x${string}`]
        });

        const hash = await walletClient.writeContract(request);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        
        toast.success('Successfully sent gMammoth!', {
            position: "top-center",
            autoClose: 3000,
        });
        
        return hash;
    } catch (error) {
        const errorMessage = handleContractError(error);
        console.error('Error sending gMammoth:', {
            error,
            message: errorMessage,
            toAddress
        });
        toast.error(errorMessage, {
            position: "top-center",
            autoClose: 3000,
        });
        throw error; // Re-throw to handle in UI
    }
};

type ContractEvent = {
  args: {
    from: string;
    to: string;
    user?: string;
    timestamp?: bigint;
  };
}

/**
 * Sets up an event listener for incoming gMammoth messages
 * @param userAddress The address to listen for messages to
 * @returns Cleanup function to remove the event listener
 */
export const setupGMammothEventListener = (userAddress: string): (() => void) => {
  console.log('Setting up GMammoth event listener for', userAddress);
  
  try {
    const unwatch = publicClient.watchContractEvent({
      address: mammothContract.address,
      abi: mammothContract.abi,
      eventName: 'GMammothSent',
      onLogs: (logs) => {
        console.log('Received logs:', logs);
        try {
          for (const log of logs) {
            const { from, to } = (log as unknown as ContractEvent).args;
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
    return () => {}; 
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

type ToastPosition = "top-center";
type ToastConfig = {
  position: ToastPosition;
  autoClose: number;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  icon?: boolean;
  theme?: "dark" | "light";
};

