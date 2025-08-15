import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameEngine from '../gmp-simulation/GmpSimulation';

interface DraggableGameCardProps {
  moduleId?: string;
  mode?: string;
}

const DraggableGameCard: React.FC<DraggableGameCardProps> = ({ moduleId: propModuleId, mode }) => {
  // Get moduleId from props or route params
  const params = useParams<{ moduleId: string }>();
  const moduleId = propModuleId || params.moduleId || '1';
  const navigate = useNavigate();
  
  // We don't need device layout detection here as the GameEngine component
  // has its own implementation

  // Handler for proceeding to level 2 or returning to modules page
  const handleProceedToLevel2 = () => {
    // For HL1 module, navigate back to modules page
    if (moduleId === "HL1") {
      navigate('/modules');
    } else {
      // For other modules, proceed to level 2
      navigate(`/modules/${moduleId}/levels/2`);
    }
  };

  // Use the provided mode or default to "level1"
  const gameMode = mode || "level1";

  return (
    <div className="h-full w-full flex flex-col">
      <GameEngine 
        mode={gameMode} 
        onProceedToLevel2={handleProceedToLevel2} 
      />
    </div>
  );
};

export default DraggableGameCard;
