"use client";

import { register } from "../utils/contractInteractions";
import { useState } from "react";
import { Spinner } from "./Spinner";

const RegisterButton = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    try {
      setIsRegistering(true);
      await register();
    } catch (error) {
      console.error("Failed to register:", error);
      // Error is already handled in the register function with toast
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <button
      onClick={handleRegister}
      disabled={isRegistering}
      className="bg-mainAccent shadow-mainGlow shadow-lg  text-gray-800 font-semibold 
        rounded-full shadow-lg p-6 transition-all duration-200 ease-in-out
        transform hover:scale-105 active:scale-95
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      <span className="text-2xl">🦣</span>
      {isRegistering ? (
        <div className="flex items-center gap-2">
          <Spinner className="w-5 h-5" />
          <span className="text-xl">Registering...</span>
        </div>
      ) : (
        <span className="text-xl">Register to gMammoth</span>
      )}
    </button>
  );
};

export default RegisterButton; 