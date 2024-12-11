"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import User from "./User";
import RegisterButton from "./RegisterButton";
import { 
  getRegisteredWallets, 
  isRegistered, 
  setupGMammothEventListener,
  setupRegistrationEventListener,
  setupDeregistrationEventListener
} from "../utils/contractInteractions";

/**
 * MainContent component handles the main UI logic and state management
 * for the gMammoth application
 */
const MainContent = () => {
  // Wallet connection state from wagmi
  const { address, isConnected } = useAccount();
  
  // Application state
  const [walletAddresses, setWalletAddresses] = useState<string[]>([]);
  const [isUserRegistered, setIsUserRegistered] = useState<boolean>(false);
  const [error, setError] = useState({ type: '', message: '' });

  // Effect to fetch initial data and setup registration event listeners
  useEffect(() => {
    const fetchData = async () => {
      if (isConnected && address) {
        const [addresses, registered] = await Promise.all([
          getRegisteredWallets(),
          isRegistered(address)
        ]);
        setWalletAddresses(addresses);
        setIsUserRegistered(registered);
      }
    };

    fetchData();

    let unsubscribeRegistration: (() => void) | undefined;
    if (isConnected && address) {
      unsubscribeRegistration = setupRegistrationEventListener(() => {
        fetchData();
      });
    }

    const unsubscribeDeregistration = setupDeregistrationEventListener(() => {
      fetchData();
    });

    return () => {
      if (unsubscribeRegistration) {
        unsubscribeRegistration();
      }
      unsubscribeDeregistration();
    };
  }, [isConnected, address]);

  // Effect to setup gMammoth message event listener
  useEffect(() => {
    let unwatchFn: (() => void) | undefined;

    const setupEventListener = async () => {
      if (isConnected && address && isUserRegistered) {
        unwatchFn = setupGMammothEventListener(address);
      }
    };

    setupEventListener();

    return () => {
      if (unwatchFn) {
        unwatchFn();
      }
    };
  }, [isConnected, address, isUserRegistered]);

  // Render states for different user scenarios
  if (error.type) {
    return (
      <div className="bg-mainBackground min-h-screen w-full p-5 flex items-center justify-center">
        <div className="text-xl">{error.message}</div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen w-full p-5 flex items-center justify-center">
        <div className="rounded-lg bg-mainAccent font-semibold 
        shadow-lg p-6 transition-all duration-200 ease-in-out
        transform flex items-center justify-center gap-2">Connect Wallet To Start</div>
      </div>
    );
  }

  if (!isUserRegistered) {
    return (
      <div className="min-h-screen w-full p-5 flex items-center justify-center ">
        <RegisterButton />
      </div>
    );
  }

  // Main UI render
  return (
    <div className="min-h-screen w-full p-5 ">
      <div className="flex flex-col flex-wrap h-[calc(100vh-40px)] gap-4 content-start mt-[80px]">
        {walletAddresses.map((address, index) => (
          <User key={address + index} walletAddress={address} />
        ))}

      </div>
    </div>
  );
};

export default MainContent;
