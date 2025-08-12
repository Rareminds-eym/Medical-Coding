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
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-4 lg:p-6 text-center">
        <div className="flex justify-center mb-3 lg:mb-4">
          <CheckCircle className="w-12 h-12 lg:w-16 lg:h-16 text-green-500" />
        </div>
        
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
          Level 1 Complete!
        </h2>
        
        <p className="text-gray-600 mb-3 text-xs lg:text-sm">
          Excellent work identifying violations and root causes for all 5 cases! 
          Now let's move to Level 2 where you'll select the best solutions.
        </p>
        
        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-900 text-sm">Time Taken</span>
          </div>
          <div className="text-xl font-bold text-blue-600">
            {formatTime(level1CompletionTime)}
          </div>
        </div>
        
        <button
          onClick={onProceed}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 mx-auto text-sm"
        >
          <span>PROCEED</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};