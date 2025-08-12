import React, { useState } from "react";
import { Search, ChevronRight, CheckCircle, Target, X } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useDeviceLayout } from "../hooks/useOrientation";
import { Question } from "./HackathonData";

interface Level1CardProps {
  question: Question;
  onAnswer: (answer: Partial<{ violation: string; rootCause: string }>) => void;
  onNext: () => void;
  currentAnswer?: { violation?: string; rootCause?: string };
  session_id?: string | null;
  email?: string | null;
}

// Draggable Item Component
interface DraggableItemProps {
  id: string;
  text: string;
  type: "violation" | "rootCause";
  isSelected: boolean;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  text,
  type,
  isSelected,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { text, type },
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  const colorClasses = isSelected
    ? "pixel-border bg-gradient-to-r from-cyan-500 to-blue-500"
    : "pixel-border bg-gradient-to-r from-gray-600 to-gray-700 hover:from-cyan-600 hover:to-blue-600";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-2 cursor-grab transition-all select-none touch-none ${colorClasses} ${
        isDragging ? "opacity-0" : ""
      }`}
    >
      <span className="text-white text-xs font-bold pixel-text">{text}</span>
    </div>
  );
};

// Droppable Zone Component
interface DroppableZoneProps {
  id: string;
  type: "violation" | "rootCause";
  selectedItems: string[];
  onRemove: (item: string) => void;
  children: React.ReactNode;
}

const DroppableZone: React.FC<DroppableZoneProps> = ({
  id,
  type,
  selectedItems,
  onRemove,
  children,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { type },
  });

  return (
    <div ref={setNodeRef} className="h-full relative">
      {/* Drop Zone Effects */}
      {isOver && (
        <div className="absolute inset-0">
          <div className="absolute inset-1 border-2 border-dashed border-cyan-300 animate-pulse rounded-lg"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-3 border-yellow-400 rounded-full opacity-60 animate-ping"></div>
          <div className="absolute inset-2 bg-cyan-400 opacity-20 animate-pulse rounded-lg"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-black animate-bounce pixel-text">
            DROP HERE!
          </div>
        </div>
      )}

      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

const Level1Card: React.FC<Level1CardProps> = ({
  question,
  onAnswer,
  onNext,
  currentAnswer,
}) => {
  // Single selections only - using arrays for consistency with existing interface
  const [selectedViolations, setSelectedViolations] = useState<string[]>(
    currentAnswer?.violation ? [currentAnswer.violation] : []
  );
  const [selectedRootCauses, setSelectedRootCauses] = useState<string[]>(
    currentAnswer?.rootCause ? [currentAnswer.rootCause] : []
  );
  // Track used items to remove them from the source area
  const [usedItems, setUsedItems] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<{
    text: string;
    type: "violation" | "rootCause";
  } | null>(null);
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;

  // Add CSS for scrollbar styling
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-thin::-webkit-scrollbar {
        width: 6px;
      }
      .scrollbar-thin::-webkit-scrollbar-track {
        background-color: rgba(30, 41, 59, 0.5);
        border-radius: 3px;
      }
      .scrollbar-thin::-webkit-scrollbar-thumb {
        background-color: rgba(59, 130, 246, 0.7);
        border-radius: 3px;
      }
      .scrollbar-thumb-purple-500::-webkit-scrollbar-thumb {
        background-color: rgba(168, 85, 247, 0.7);
      }
      .scrollbar-thumb-blue-500::-webkit-scrollbar-thumb {
        background-color: rgba(59, 130, 246, 0.7);
      }
      .scrollbar-track-purple-700::-webkit-scrollbar-track {
        background-color: rgba(126, 34, 206, 0.2);
      }
      .scrollbar-track-blue-700::-webkit-scrollbar-track {
        background-color: rgba(29, 78, 216, 0.2);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Reset fields when question changes
  React.useEffect(() => {
    const initialViolations = currentAnswer?.violation ? [currentAnswer.violation] : [];
    const initialRootCauses = currentAnswer?.rootCause ? [currentAnswer.rootCause] : [];
    
    setSelectedViolations(initialViolations);
    setSelectedRootCauses(initialRootCauses);
    
    // Update used items based on what's already selected
    const newUsedItems = new Set<string>();
    initialViolations.forEach(v => newUsedItems.add(v));
    initialRootCauses.forEach(r => newUsedItems.add(r));
    setUsedItems(newUsedItems);
    
    setActiveItem(null);
  }, [question.id, currentAnswer]);

  // Setup sensors for drag and drop with higher thresholds to prevent click selection
  const sensors = useSensors(
    // Mouse sensor for desktop - requires significant movement
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // Require 10px movement to start drag
      },
    }),
    // Touch sensor with delay to distinguish from taps
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms delay to prevent tap selection
        tolerance: 5, // Lower tolerance after delay
      },
    }),
    // Pointer sensor with higher distance threshold
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isMobile ? 8 : 10, // Higher distance requirement
        delay: isMobile ? 100 : 0, // Small delay on mobile
        tolerance: 5, // Lower tolerance
      },
    })
  );

  const canProceed = selectedViolations.length > 0 && selectedRootCauses.length > 0;

  // Shuffle function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Combine and shuffle violations and root causes
  const combinedOptions = React.useMemo(() => {
    // Filter out options that have already been placed in drop zones
    const violations = question.violationOptions
      .filter(option => !usedItems.has(option)) // Filter out used items
      .map((option, index) => ({
        id: `violation-${index}`,
        text: option,
        type: "violation" as const,
        isSelected: selectedViolations.includes(option),
      }));

    const rootCauses = question.rootCauseOptions
      .filter(option => !usedItems.has(option)) // Filter out used items
      .map((option, index) => ({
        id: `rootCause-${index}`,
        text: option,
        type: "rootCause" as const,
        isSelected: selectedRootCauses.includes(option),
      }));

    return shuffleArray([...violations, ...rootCauses]);
  }, [
    question.violationOptions,
    question.rootCauseOptions,
    selectedViolations,
    selectedRootCauses,
    usedItems, // Add usedItems as dependency
  ]);

  const handleViolationSelect = (violation: string) => {
    // Only allow one violation selection - replace existing selection
    if (selectedViolations.length > 0) {
      // Remove the previous selection from used items
      setUsedItems(prev => {
        const newUsedItems = new Set(prev);
        selectedViolations.forEach(v => newUsedItems.delete(v));
        return newUsedItems;
      });
    }
    
    const newViolations = [violation]; // Only one selection allowed
    setSelectedViolations(newViolations);
    // Mark the item as used
    setUsedItems(prev => {
      const newUsedItems = new Set(prev);
      newUsedItems.add(violation);
      return newUsedItems;
    });
    // For backward compatibility with the onAnswer interface
    onAnswer({ violation: newViolations.join(',') });
  };

  const handleRootCauseSelect = (rootCause: string) => {
    // Only allow one root cause selection - replace existing selection
    if (selectedRootCauses.length > 0) {
      // Remove the previous selection from used items
      setUsedItems(prev => {
        const newUsedItems = new Set(prev);
        selectedRootCauses.forEach(r => newUsedItems.delete(r));
        return newUsedItems;
      });
    }
    
    const newRootCauses = [rootCause]; // Only one selection allowed
    setSelectedRootCauses(newRootCauses);
    // Mark the item as used
    setUsedItems(prev => {
      const newUsedItems = new Set(prev);
      newUsedItems.add(rootCause);
      return newUsedItems;
    });
    // For backward compatibility with the onAnswer interface
    onAnswer({ rootCause: newRootCauses.join(',') });
  };

  // Remove a violation from the list
  const handleRemoveViolation = (violation: string) => {
    const newViolations = selectedViolations.filter(v => v !== violation);
    setSelectedViolations(newViolations);
    // Remove the item from used list so it reappears in the source area
    setUsedItems(prev => {
      const newUsedItems = new Set(prev);
      newUsedItems.delete(violation);
      return newUsedItems;
    });
    onAnswer({ violation: newViolations.join(',') });
  };

  // Remove a root cause from the list
  const handleRemoveRootCause = (rootCause: string) => {
    const newRootCauses = selectedRootCauses.filter(r => r !== rootCause);
    setSelectedRootCauses(newRootCauses);
    // Remove the item from used list so it reappears in the source area
    setUsedItems(prev => {
      const newUsedItems = new Set(prev);
      newUsedItems.delete(rootCause);
      return newUsedItems;
    });
    onAnswer({ rootCause: newRootCauses.join(',') });
  };

  // Drag and Drop event handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedData = active.data.current as {
      text: string;
      type: "violation" | "rootCause";
    };

    if (draggedData && draggedData.text) {
      setActiveItem(draggedData);
    }
  };

  const handleDragCancel = () => {
    setActiveItem(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Always clear the active item first
    setActiveItem(null);

    if (!over) {
      return;
    }

    const draggedData = active.data.current as {
      text: string;
      type: "violation" | "rootCause";
    };
    const dropZoneData = over.data.current as {
      type: "violation" | "rootCause";
    };

    // Validate drag data
    if (!draggedData || !draggedData.text || !dropZoneData) {
      console.warn("Invalid drag or drop data:", { draggedData, dropZoneData });
      return;
    }

    // Allow any option to be dropped in any zone
    if (dropZoneData.type === "violation") {
      handleViolationSelect(draggedData.text);
    } else if (dropZoneData.type === "rootCause") {
      handleRootCauseSelect(draggedData.text);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        className="flex flex-col bg-gray-800 overflow-hidden relative"
        style={{ height: "calc(100vh - 80px)" }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-scan-lines opacity-20"></div>

        {/* PROBLEM SCENARIO */}
        {!isMobileHorizontal && (
          <div className="relative z-10 pixel-border bg-gradient-to-r from-gray-600 to-gray-700 p-4 m-2 mb-0">
            <h3 className="text-cyan-100 font-black pixel-text mb-2">
              PROBLEM SCENARIO
            </h3>
            <p className="text-cyan-50 text-sm font-bold">
              {question.caseFile} <br />
              Read the scenario carefully, spot the violation and its root
              cause, and place them in the right category containers.
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex p-2 space-x-3 min-h-0">
          {/* COMMAND CENTER - Items Pool */}
          <div className="w-1/3 flex-shrink-0 flex flex-col min-h-0">
            <div className="pixel-border-thick bg-gray-800 p-4 flex-1 overflow-hidden flex flex-col min-h-0">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
              <div className="absolute inset-0 bg-scan-lines opacity-20"></div>

              <div className="relative z-10 flex flex-col h-full min-h-0">
                {/* Command Center Header */}
                <div className="flex items-center space-x-2 mb-3 flex-shrink-0">
                  <div className="w-6 h-6 bg-cyan-500 pixel-border flex items-center justify-center">
                    <Target className="w-4 h-4 text-cyan-900" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-cyan-300 pixel-text">
                      VIOLATION & ROOT CAUSE
                    </h2>
                    <div className="text-xs text-gray-400 font-bold">
                      ITEMS: {combinedOptions.length} | DRAG TO ZONES
                    </div>
                  </div>
                </div>

                {/* Items Pool - Scrollable with Max Height */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-gray-700">
                    <div className="space-y-2 p-1">
                      {combinedOptions.map((option, index) => (
                        <div
                          key={option.id}
                          className="animate-slideIn"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <DraggableItem
                            id={option.id}
                            text={option.text}
                            type={option.type}
                            isSelected={option.isSelected}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TARGET ZONES */}
          <div className="flex-1 flex gap-3 min-h-0">
            {/* Violation Scanner */}
            <div
              className="flex-1 animate-slideIn"
              style={{ animationDelay: "0ms" }}
            >
              <div className="pixel-border-thick bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 h-full relative overflow-hidden transition-all duration-300 rounded-lg flex flex-col">
                {/* Header */}
                <div className="relative z-10 p-3 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-blue-800 pixel-border flex items-center justify-center">
                          <Target className="w-3 h-3 text-blue-300" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white pixel-text">
                          VIOLATION
                        </h3>
                        <div className="text-white/80 text-xs">
                          Scanner Zone
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drop Zone */}
                <div className="px-3 pb-3 flex-1 min-h-0 overflow-y-auto relative z-10">
                  <DroppableZone
                    id="violation-zone"
                    type="violation"
                    selectedItems={selectedViolations}
                    onRemove={handleRemoveViolation}
                  >
                    {selectedViolations.length > 0 ? (
                      <div className="h-full flex flex-col">
                        {/* Status Header */}
                        <div className="text-center py-2 border-b border-blue-700/30">
                          <div className="w-8 h-8 bg-blue-800 pixel-border mx-auto mb-1 flex items-center justify-center animate-pulse">
                            <CheckCircle className="w-5 h-5 text-blue-300" />
                          </div>
                          <p className="text-blue-100 font-black pixel-text text-xs">
                            VIOLATIONS DETECTED: {selectedViolations.length}
                          </p>
                        </div>

                        {/* Dropped Items Display */}
                        <div className="flex-1 p-3 space-y-3 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-700">
                          {selectedViolations.map((violation, index) => (
                            <div key={`v-${index}`} className="w-full">
                              <div className="pixel-border-thick bg-gradient-to-r from-blue-900 to-blue-700 p-3 relative overflow-hidden">
                                {/* Background Pattern */}
                                <div className="absolute inset-0 bg-pixel-pattern opacity-20"></div>

                                {/* Content */}
                                <div className="relative z-10">
                                  <div className="flex items-center mb-2 pr-6">
                                    <div className="w-6 h-6 bg-blue-800 pixel-border mr-2 flex items-center justify-center flex-shrink-0">
                                      <Target className="w-4 h-4 text-blue-300" />
                                    </div>
                                    <p className="text-white text-xs font-black pixel-text leading-tight">
                                      {violation}
                                    </p>
                                    <button 
                                      onClick={() => handleRemoveViolation(violation)} 
                                      className="absolute top-2 right-2 hover:text-red-300 transition-colors"
                                      aria-label="Remove item"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Success Animation */}
                                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-800 rounded-full animate-ping"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-white/20 mx-auto mb-3 flex items-center justify-center rounded-full">
                          <Target className="w-8 h-8 text-white/60" />
                        </div>
                        <p className="text-white/80 font-bold text-sm">
                          DROP ZONE
                        </p>
                        <p className="text-white/60 text-xs">
                          Drag violations here
                        </p>
                      </div>
                    )}
                  </DroppableZone>
                </div>
              </div>
            </div>

            {/* Root Cause Analyzer */}
            <div
              className="flex-1 animate-slideIn"
              style={{ animationDelay: "150ms" }}
            >
              <div className="pixel-border-thick bg-gradient-to-r from-cyan-600 to-blue-600 h-full relative overflow-hidden transition-all duration-300 rounded-lg flex flex-col">
                {/* Header */}
                <div className="relative z-10 p-3 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-purple-800 pixel-border flex items-center justify-center">
                          <Search className="w-3 h-3 text-purple-300" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white pixel-text">
                          ROOT CAUSE
                        </h3>
                        <div className="text-purple-100/80 text-xs">
                          Analyzer Zone
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drop Zone */}
                <div className="px-3 pb-3 flex-1 min-h-0 overflow-y-auto relative z-10">
                  <DroppableZone
                    id="rootCause-zone"
                    type="rootCause"
                    selectedItems={selectedRootCauses}
                    onRemove={handleRemoveRootCause}
                  >
                    {selectedRootCauses.length > 0 ? (
                      <div className="h-full flex flex-col">
                        {/* Status Header */}
                        <div className="text-center py-2 border-b border-purple-700/30">
                          <div className="w-8 h-8 bg-purple-800 pixel-border mx-auto mb-1 flex items-center justify-center animate-pulse">
                            <CheckCircle className="w-5 h-5 text-purple-300" />
                          </div>
                          <p className="text-purple-100 font-black pixel-text text-xs">
                            ROOT CAUSES FOUND: {selectedRootCauses.length}
                          </p>
                        </div>

                        {/* Dropped Items Display */}
                        <div className="flex-1 p-3 space-y-3 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-purple-700">
                          {selectedRootCauses.map((rootCause, index) => (
                            <div key={`rc-${index}`} className="w-full">
                              <div className="pixel-border-thick bg-gradient-to-r from-purple-900 to-purple-700 p-3 relative overflow-hidden">
                                {/* Background Pattern */}
                                <div className="absolute inset-0 bg-pixel-pattern opacity-20"></div>

                                {/* Content */}
                                <div className="relative z-10">
                                  <div className="flex items-center mb-2 pr-6">
                                    <div className="w-6 h-6 bg-purple-800 pixel-border mr-2 flex items-center justify-center flex-shrink-0">
                                      <Search className="w-4 h-4 text-purple-300" />
                                    </div>
                                    <p className="text-white text-xs font-black pixel-text leading-tight">
                                      {rootCause}
                                    </p>
                                    <button 
                                      onClick={() => handleRemoveRootCause(rootCause)} 
                                      className="absolute top-2 right-2 hover:text-red-300 transition-colors"
                                      aria-label="Remove item"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Success Animation */}
                                <div className="absolute top-1 right-1 w-2 h-2 bg-purple-800 rounded-full animate-ping"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-white/20 mx-auto mb-3 flex items-center justify-center rounded-full">
                          <Search className="w-8 h-8 text-white/60" />
                        </div>
                        <p className="text-white/80 font-bold text-sm">
                          DROP ZONE
                        </p>
                        <p className="text-white/60 text-xs">
                          Drag root causes here
                        </p>
                      </div>
                    )}
                  </DroppableZone>
                </div>
              </div>
            </div>
          </div>

          {/* Proceed Button - Fixed Position */}
          <div className="absolute bottom-4 right-4 z-20">
            <button
              onClick={onNext}
              disabled={!canProceed}
              className={`flex items-center space-x-2 px-4 py-3 pixel-border font-black pixel-text transition-all shadow-lg ${
                canProceed
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white transform hover:scale-105"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
              }`}
            >
              <span className="text-sm">PROCEED</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <div
            className="pixel-border bg-gradient-to-r from-cyan-500 to-blue-500 p-2 cursor-grabbing transform scale-110 opacity-95 shadow-2xl pointer-events-none"
            style={{ zIndex: 9999 }}
          >
            <span className="text-white text-xs font-black pixel-text">
              {activeItem.text}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export { Level1Card };
export default Level1Card;
