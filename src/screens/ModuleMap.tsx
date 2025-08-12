import React, { useState, useEffect } from 'react';
import { modules as initialModules } from '../data/modules';
import ModuleMap from '../components/modules/ModuleMap';
import { useDeviceLayout } from '../hooks/useOrientation';
import { useAuth } from '../contexts/AuthContext';
import type { Module } from '../types/module';

const ModuleMapScreen: React.FC = () => {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [currentModuleId, setCurrentModuleId] = useState(1); // Current available module
  const { isHorizontal: isLandscape } = useDeviceLayout();
  const { user } = useAuth();

  // Function to modify modules based on user email
  const getModulesForUser = (userEmail: string | undefined): Module[] => {
    if (userEmail === "hackathontest@gmail.com") {
      // For hackathontest@gmail.com: unlock HL1 & HL2, lock 1,2,3,4
      return initialModules.map(module => {
        if (module.id === "HL1" || module.id === "HL2") {
          return { ...module, status: 'available' as const };
        } else if (module.id === "1" || module.id === "2" || module.id === "3" || module.id === "4") {
          return { ...module, status: 'locked' as const };
        }
        return module;
      });
    }
    // For all other users, return original modules
    return initialModules;
  };

  // Update modules when user changes
  useEffect(() => {
    const updatedModules = getModulesForUser(user?.email);
    setModules(updatedModules);
    
    // Update current module ID based on user
    if (user?.email === "hackathontest@gmail.com") {
      // For hackathon user, set to first hackathon level if available
      const firstHackathonModule = updatedModules.find(m => m.id === "HL1" && m.status === 'available');
      if (firstHackathonModule) {
        setCurrentModuleId(1); // This is mainly for display, actual selection happens through the module nodes
      }
    } else {
      // For regular users, keep the default behavior
      setCurrentModuleId(1);
    }
  }, [user?.email]);

  const handleModuleSelect = (id: string | number) => {
    const moduleId = typeof id === 'number' ? id.toString() : id;
    const selectedModule = modules.find(m => m.id === moduleId);
    
    if (selectedModule && (selectedModule.status === 'available' || selectedModule.status === 'completed')) {
      // Handle numeric IDs for regular modules
      if (typeof id === 'number') {
        setCurrentModuleId(id);
      } else if (!isNaN(parseInt(moduleId, 10))) {
        setCurrentModuleId(parseInt(moduleId, 10));
      }
      
      // Log selection for debugging
      console.log(`Selected module ${moduleId}: ${selectedModule.title}`);
      
      // Demo: Show alert for now
      alert(`Starting Module ${moduleId}: ${selectedModule.title}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden">
      {/* You can now use isMobile as needed */}
      {isLandscape && (
        <ModuleMap
          modules={modules}
          currentModuleId={currentModuleId}
          onModuleSelect={handleModuleSelect}
        />
      )}
    </div>
  );
};

export {ModuleMapScreen};