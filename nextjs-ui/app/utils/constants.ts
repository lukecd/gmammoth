export const TOAST_CONFIG = {
  DEFAULT: {
    position: "top-center" as const,
    autoClose: 3000,
  },
  MESSAGE: {
    position: "top-center" as const,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    icon: false,
    theme: "dark" as const,
  }
} as const; 