'use client'

import Image from 'next/image'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { 
  deregister, 
  setupRegistrationEventListener, 
  setupDeregistrationEventListener,
  isRegistered 
} from '../utils/contractInteractions'
import { useRegistrationStatus } from '../hooks/useRegistrationStatus'

const TopNav = () => {
  const { address, isConnected } = useAccount()
  const [isDeregistering, setIsDeregistering] = useState(false)
  const { isUserRegistered, refetch } = useRegistrationStatus()

  const handleDeregister = async () => {
    if (!address) return
    
    setIsDeregistering(true)
    try {
      await deregister()
    } catch (error) {
      console.error('Failed to deregister:', error)
    } finally {
      setIsDeregistering(false)
    }
  }

  useEffect(() => {
    // Set up event listeners
    const unsubscribeRegistration = setupRegistrationEventListener(() => {
      // Refetch registration status when events occur
      if (address) isRegistered(address).then(() => refetch());
    });

    const unsubscribeDeregistration = setupDeregistrationEventListener(() => {
      if (address) isRegistered(address).then(() => refetch());
    });

    return () => {
      unsubscribeRegistration();
      unsubscribeDeregistration();
    };
  }, [address]);

  return (
    <nav className="fixed w-full h-20 bg-headerBackground text-headerForeground flex items-center justify-between px-6 shadow-lg
     shadow-mainGlow z-50">
      {/* Left - Mammoth Logo */}
      <div className="h-[60px] w-[60px] relative rounded-full overflow-hidden shadow-md
     shadow-mainGlow">
        <Image
          src="/mammoth.png"
          alt="Mammoth Logo"
          fill
          className="object-cover"
        />
      </div>

      {/* Center - Title */}
      <div className="text-3xl font-bold text-white">
        gMammoth
      </div>

      {/* Right - Connect Button and Deregister */}
      <div className="flex gap-4 items-center">
        <ConnectButton />
        
        {isConnected && isUserRegistered && (
          <button
            onClick={handleDeregister}
            disabled={isDeregistering}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm
     shadow-mainGlow disabled:cursor-not-allowed"
          >
            {isDeregistering ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deregistering...
              </div>
            ) : (
              'Deregister'
            )}
          </button>
        )}
      </div>
    </nav>
  )
}

export default TopNav
