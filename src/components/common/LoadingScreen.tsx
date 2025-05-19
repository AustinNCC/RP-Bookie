import React from 'react';
import { Lock as Shamrock } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Shamrock className="h-16 w-16 text-primary animate-pulse" />
      <h2 className="mt-4 text-2xl font-semibold text-white">Loading...</h2>
    </div>
  );
};

export default LoadingScreen;