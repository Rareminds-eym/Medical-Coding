import React from 'react';
import { useParams } from 'react-router-dom';
import BingoGame from '../BingoGame';
import DraggableGameCard from '../DraggableGameCard';
import { module4Level1Questions } from '../../data/Level1';
import { module3Level1Questions } from '../../data/Level1/module3';
import { module2Level1Questions } from '../../data/Level1/module2';
import { module1Level1Questions } from '../../data/Level1/module1';
// Import other module question sets as needed

// Map moduleId to question data
const level1QuestionsMap: Record<string, any> = {
  '1': module1Level1Questions, // Default: BingoGame uses its own data for Module 1
  '2': module2Level1Questions,
  '3': module3Level1Questions,
  '4': module4Level1Questions,
  // Add more modules as needed
};

// Define modules that should use the GMP simulation interface instead of Bingo
const gmpModuleIds = ['3']; // Regular modules that use the draggable interface

// Hackathon modules also use the GMP simulation interface but with special modes
const hackathonModuleIds = ['HL1', 'HL2'];

const Level1Index: React.FC = () => {
  // Support route: /modules/:moduleId/levels/:levelId
  const { moduleId, levelId } = useParams<{ moduleId: string; levelId: string }>();

  // Log params for debugging
  console.log('[Level1Index] Route params:', { moduleId, levelId });

  // Use moduleId to select questions
  const questions = moduleId ? level1QuestionsMap[moduleId] : undefined;

  // Check if we should use the GMP simulation interface (regular or hackathon)
  const isRegularGmpModule = moduleId && gmpModuleIds.includes(moduleId);
  const isHackathonModule = moduleId && hackathonModuleIds.includes(moduleId);
  const shouldUseGmpSimulation = isRegularGmpModule || isHackathonModule;

  console.log('[Level1Index] moduleId:', moduleId);
  console.log('[Level1Index] questions length:', questions?.length || 0);
  console.log('[Level1Index] Using GMP simulation:', shouldUseGmpSimulation);
  console.log('[Level1Index] Is hackathon module:', isHackathonModule);

  // Conditionally render either BingoGame or DraggableGameCard based on module
  if (shouldUseGmpSimulation) {
    if (isHackathonModule) {
      // For hackathon modules, pass the appropriate mode
      const mode = moduleId === 'HL1' ? 'violation-root-cause' : 'solution';
      return <DraggableGameCard moduleId={moduleId} mode={mode} />;
    } else {
      // Regular GMP simulation modules
      return <DraggableGameCard moduleId={moduleId} />;
    }
  } else {
    // Regular Bingo game
    return <BingoGame moduleId={moduleId} questions={questions} />;
  }
};

export default Level1Index;
