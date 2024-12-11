interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className = "w-4 h-4" }: SpinnerProps) => {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 ${className}`}
    />
  );
}; 