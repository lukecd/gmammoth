import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { isRegistered, setupRegistrationEventListener } from '../utils/contractInteractions';

export const useRegistrationStatus = () => {
  const { address } = useAccount();
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (address) {
      const registered = await isRegistered(address);
      setIsUserRegistered(registered);
    }
  }, [address]);

  useEffect(() => {
    const checkRegistration = async () => {
      if (address) {
        const registered = await isRegistered(address);
        setIsUserRegistered(registered);
      }
      setLoading(false);
    };

    checkRegistration();

    let unsubscribeRegistration: (() => void) | undefined;
    if (address) {
      unsubscribeRegistration = setupRegistrationEventListener(() => {
        checkRegistration(); // Refresh registration status when event occurs
      });
    }

    return () => {
      if (unsubscribeRegistration) {
        unsubscribeRegistration();
      }
    };
  }, [address]);

  return { isUserRegistered, loading, refetch };
}; 