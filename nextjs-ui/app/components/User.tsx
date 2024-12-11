'use client';

import Image from 'next/image';
import { useState, useEffect, memo } from 'react';
import clsx from 'clsx';
import { sendGMammoth } from '../utils/contractInteractions';

interface UserProps {
    walletAddress: string;
}

/**
 * User component represents a registered wallet that can receive gMammoth messages
 * Memoized to prevent unnecessary re-renders
 */
const User = memo(({ walletAddress }: UserProps) => {
    // UI state
    const [isPressed, setIsPressed] = useState(false);
    const [txActive, setTxActive] = useState(false);
    const [colorClasses, setColorClasses] = useState({
        bg: '',
        border: '',
        shadow: ''
    });

    // Generate random colors on mount
    useEffect(() => {
        const getUniqueRandomColors = () => {
            const colors = ['box1', 'box2', 'box3', 'box4', 'box5'];
            const selected = [];
            
            for (let i = 0; i < 3; i++) {
                const randomIndex = Math.floor(Math.random() * colors.length);
                selected.push(colors[randomIndex]);
                colors.splice(randomIndex, 1);
            }
            
            return selected;
        };

        const [bgColor, borderColor, shadowColor] = getUniqueRandomColors();
        
        setColorClasses({
            bg: `bg-${bgColor}`,
            border: `border-${borderColor}`,
            shadow: `shadow-${shadowColor}`
        });
    }, []);

    /**
     * Formats wallet address for display
     * @param address Full wallet address
     * @returns Shortened address with ellipsis
     */
    const formatAddress = (address: string) => {
        return `${address.slice(0, 5)}...${address.slice(-5)}`;
    };

    /**
     * Handles sending a gMammoth message
     * Manages transaction state and error handling
     */
    const doSendgMammoth = async () => {
        setTxActive(true);
        
        try {
            const txHash = await sendGMammoth(walletAddress);
            console.log('Transaction sent:', txHash);
        } catch (error) {
            console.error('Transaction failed:', error);
        } finally {
            setTxActive(false);
        }
    };

    return (
        <div
            className={clsx(
                'relative',
                'w-[150px]',
                'h-[150px]',
                'cursor-pointer',
                'transition-all',
                'duration-300',
                'ease-in-out',
                'shadow-lg',
                'hover:shadow-xl',
                'border-4',
                'overflow-hidden',
                'rounded-xl',
                colorClasses.bg,
                colorClasses.border,
                colorClasses.shadow,
                {
                    'transform scale-95': isPressed
                }
            )}
            onClick={() => {
                if (!txActive) {
                    setIsPressed(true);
                    doSendgMammoth();
                    setTimeout(() => setIsPressed(false), 200);
                }
            }}
        >
            {(txActive) ? (
                <Image
                    src="/mammoth.png"
                    alt="Mammoth"
                    fill
                    className={`object-cover ${txActive ? 'animate-pulse' : ''}`}
                    priority
                />
            ) : (
                <div className="
                    absolute
                    top-1/2
                    left-1/2
                    transform
                    -translate-x-1/2
                    -translate-y-8
                    font-bold
                    text-gray-800
                    text-center
                    leading-none
                ">
                    Send gMammoth
                </div>
            )}
            <div className="
                absolute
                bottom-[20%]
                left-0
                right-0
                text-center
                bg-black/70
                text-white
                py-1
                px-2
                text-sm
                font-medium
                z-10
            ">
                {formatAddress(walletAddress)}
            </div>
        </div>
    );
});

export default User;
