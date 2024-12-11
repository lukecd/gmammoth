import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'bg-box1', 'bg-box2', 'bg-box3', 'bg-box4', 'bg-box5',
    'border-box1', 'border-box2', 'border-box3', 'border-box4', 'border-box5',
    'shadow-box1', 'shadow-box2', 'shadow-box3', 'shadow-box4', 'shadow-box5',
  ],
  theme: {
    extend: {
      colors: {
        mainBackground: "#7b2bf9",
        mainAccent: "#fd63d9",
        mainGlow: "#91f5e6",
        headerBackground: "#000000",
        headerForeground: "#f4668d",
        box1: "#fd63d9",
        box2: "#91f5e6",
        box3: "#ffffc5",
        box4: "#ffdaae",
        box5: "#f4668d",
      },
      keyframes: {
        'spin-once': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'spin-once': 'spin-once 1s ease-in-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config;
