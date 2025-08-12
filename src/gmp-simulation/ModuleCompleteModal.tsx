import React from 'react';
import { CheckCircle, Clock, ChevronRight } from 'lucide-react';

interface ModuleCompleteModalProps {
  level1CompletionTime: number;
  onProceed: () => void;
}

export const ModuleCompleteModal: React.FC<ModuleCompleteModalProps> = ({
  level1CompletionTime,
  onProceed
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
  <div className="bg-[#0b1e2d] border-2 border-black shadow-[4px_4px_0px_black] max-w-sm w-full p-4 lg:p-6 text-center">
    
    {/* Icon */}
    <div className="flex justify-center mb-3 lg:mb-4">
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 border-2 border-black p-2 lg:p-3 shadow-[2px_2px_0px_black] lg:shadow-[3px_3px_0px_black]">
        <CheckCircle className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
      </div>
    </div>
    
    {/* Title */}
    <h2 className="text-white font-mono text-lg lg:text-xl font-bold tracking-wide mb-2">
      LEVEL 1 COMPLETE!
    </h2>
    
    {/* Message */}
    <p className="text-gray-300 mb-3 text-xs lg:text-sm font-mono">
      Excellent work identifying violations and root causes for all 5 cases! 
      Now let's move to Level 2 where you'll select the best solutions.
    </p>
    
    {/* Time Taken Box */}
    <div className="bg-gradient-to-r from-indigo-500 to-blue-700 border-2 border-black p-3 shadow-[3px_3px_0px_black] mb-4">
      <div className="flex items-center justify-center space-x-2 mb-1">
        <Clock className="w-4 h-4 text-white" />
        <span className="font-bold text-white text-sm font-mono">COMPLETION TIME</span>
      </div>
      <div className="text-xl font-bold text-white font-mono">
        {formatTime(level1CompletionTime)}
      </div>
    </div>
    
    {/* Button */}
    <button
      onClick={onProceed}
      className="bg-green-500 hover:bg-green-600 border-2 border-black shadow-[3px_3px_0px_black] text-white font-bold py-2 px-4 font-mono text-sm"
    >
      PROCEED
    </button>
  </div>
</div>

  );
};