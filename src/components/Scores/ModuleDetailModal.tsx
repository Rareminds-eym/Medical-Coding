import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Trophy, Target } from 'lucide-react';
import { ModuleDetailModalProps, Level } from './types/GameData';
import { useDeviceLayout } from '../../hooks/useOrientation';
import { useAuth } from '../../contexts/AuthContext';
import { Level2GameService } from '../Level2/services/level2GameService';
import { Level2GameData } from '../../types/Level2/types';
import { level4Service } from '../Level4/services/level4services';
import { Level4GameData } from '../Level4/services/level4services';

// Level 3 interface (based on level3_history table schema)
interface Level3GameData {
  id?: number;
  user_id: string;
  module_id: string;
  session_completed_at: string;
  total_scenarios: number;
  total_score: number;
  total_time: number;
  avg_health: number;
  total_combo: number;
  scenario_results?: string;
  detailed_progress?: string;
  session_summary?: string;
  created_at?: string;
  updated_at?: string;
}

const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({ isOpen, module, onClose }) => {
  // State for Level 1 score (Modules 1-4)
  const [level1Score, setLevel1Score] = useState<number | null>(null);
  const [level1Timer, setLevel1Timer] = useState<number | null>(null);
  const [level1Loading, setLevel1Loading] = useState(false);
  const [level1Error, setLevel1Error] = useState<string | null>(null);

  // Fetch Level 1 score for Modules 1-4
  const { user } = useAuth();
  useEffect(() => {
    const fetchLevel1Score = async () => {
      if (!isOpen || !module || ![1,2,3,4].includes(module.id) || !user) return;
      setLevel1Loading(true);
      setLevel1Error(null);
      try {
        console.log('Fetching Level 1 data for:', { userId: user.id, moduleId: module.id }); // Debug log
        
        // First, let's see what records exist for this user (without module filter)
        const { data: allUserData, error: allUserError } = await supabase
          .from('level_1')
          .select('*')
          .eq('user_id', user.id);
        
        console.log('All Level 1 records for user:', { allUserData, allUserError });
        
        const { data, error } = await supabase
          .from('level_1')
          .select('*')
          .eq('user_id', user.id)
          .eq('module_number', module.id)
          .eq('level_number', 1)
          .order('game_start_time', { ascending: false });
        
        console.log('Level 1 query result:', { data, error, queryParams: { userId: user.id, moduleNumber: module.id, levelNumber: 1 } }); // Debug log
        
        if (!error && data && data.length > 0) {
          console.log('Found Level 1 records:', data.length);
          
          // Look through all records to find the best score
          let bestScore = 0;
          let bestTimer = null;
          
          for (const record of data) {
            console.log('Processing record:', record); // Debug log
            
            // Try to get score from score_history array first
            const scores = record.score_history || [];
            const timers = record.timer_history || [];
            
            if (scores.length > 0) {
              const maxScore = Math.max(...scores);
              if (maxScore > bestScore) {
                bestScore = maxScore;
                // Find timer for this best score
                const scoreIndex = scores.findIndex((s: number) => s === maxScore);
                if (scoreIndex >= 0 && timers.length > scoreIndex) {
                  bestTimer = timers[scoreIndex];
                }
              }
            } 
            // Fallback to direct score field
            else if (record.score !== null && record.score !== undefined && record.score > bestScore) {
              bestScore = record.score;
              bestTimer = record.timer || null;
            }
          }
          
          console.log('Best score found:', { bestScore, bestTimer }); // Debug log
          setLevel1Score(bestScore);
          setLevel1Timer(bestTimer);
        } else {
          console.log('No Level 1 data found or error:', error); // Debug log
          setLevel1Score(0);
          setLevel1Timer(null);
        }
      } catch (err) {
        console.error('Level 1 fetch error:', err); // Debug log
        setLevel1Error('Failed to load Level 1 score');
      } finally {
        setLevel1Loading(false);
      }
    };
    fetchLevel1Score();
  }, [isOpen, module, user]);

  // Fetch Level 4 score directly from Supabase for Modules 1-4
  useEffect(() => {
    const fetchLevel4Score = async () => {
      if (!isOpen || !module || ![1,2,3,4].includes(module.id) || !user) return;
      setLevel4Loading(true);
      setLevel4Error(null);
      try {
        const { data, error } = await supabase
          .from('level_4')
          .select('score, is_completed')
          .eq('user_id', user.id)
          .eq('module', module.id)
          .eq('level', 4)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (!error && data && data.length > 0) {
          setLevel4Score(data[0].score || 0);
          setLevel4Completed(data[0].is_completed || false);
        } else {
          setLevel4Score(0);
          setLevel4Completed(false);
        }
      } catch (err) {
        setLevel4Error('Failed to load Level 4 score');
        console.error('Level 4 fetch error:', err);
      } finally {
        setLevel4Loading(false);
      }
    };
    fetchLevel4Score();
  }, [isOpen, module, user]);
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileLandscape = isMobile && isHorizontal;

  // State for level2_game_data
  const [level2Data, setLevel2Data] = useState<Level2GameData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // State for level3_progress
  const [level3Data, setLevel3Data] = useState<Level3GameData[]>([]);
  const [isLoadingLevel3Data, setIsLoadingLevel3Data] = useState(false);
  const [level3DataError, setLevel3DataError] = useState<string | null>(null);

  // State for level4_game_data
  const [level4Data, setLevel4Data] = useState<Level4GameData | null>(null);
  const [isLoadingLevel4Data, setIsLoadingLevel4Data] = useState(false);
  const [level4DataError, setLevel4DataError] = useState<string | null>(null);

  // State for Level 4 score (direct Supabase fetch)
  const [level4Score, setLevel4Score] = useState<number | null>(null);
  const [level4Loading, setLevel4Loading] = useState(false);
  const [level4Error, setLevel4Error] = useState<string | null>(null);
  const [level4Completed, setLevel4Completed] = useState<boolean>(false);

  // Fetch level2_game_data when modal opens for Modules 1-4
  useEffect(() => {
    const fetchLevel2Data = async () => {
      // Check if module ID is in the range 1-4
      if (!isOpen || !module || ![1, 2, 3, 4].includes(module.id) || !user) return;

      setIsLoadingData(true);
      setDataError(null);

      try {
        // Fetch all Level 2 data for the module directly from Supabase
        const { data, error } = await supabase
          .from('level2_game_data')
          .select('*')
          .eq('user_id', user.id)
          .eq('module_id', module.id.toString())
          .eq('level_number', 2)
          .order('created_at', { ascending: false });

        if (error) {
          setDataError(error.message);
        } else { 
          setLevel2Data(data || []);
        }
      } catch (err) {
        setDataError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchLevel2Data();
  }, [isOpen, module, user]);

  // Fetch level3_history when modal opens for Modules 1-4
  useEffect(() => {
    const fetchLevel3Data = async () => {
      // Check if module ID is in the range 1-4
      if (!isOpen || !module || ![1, 2, 3, 4].includes(module.id) || !user) return;

      setIsLoadingLevel3Data(true);
      setLevel3DataError(null);

      try {
        // Fetch all Level 3 data for the module directly from Supabase
        const { data, error } = await supabase
          .from('level3_history')
          .select('*')
          .eq('user_id', user.id)
          .eq('module_id', module.id.toString())
          .order('session_completed_at', { ascending: false });

        if (error) {
          setLevel3DataError(error.message);
        } else { 
          setLevel3Data(data || []);
        }
      } catch (err) {
        setLevel3DataError(err instanceof Error ? err.message : 'Failed to load Level 3 data');
      } finally {
        setIsLoadingLevel3Data(false);
      }
    };

    fetchLevel3Data();
  }, [isOpen, module, user]);

  // Fetch level4_game_data when modal opens for modules that support Level 4
  useEffect(() => {
    const fetchLevel4Data = async () => {
      if (!isOpen || !module || !user) return;

      // Level 4 is available for modules 1, 2, 3, 4 based on the cases data
      const level4Modules = [1, 2, 3, 4];
      if (!level4Modules.includes(module.id)) return;

      setIsLoadingLevel4Data(true);
      setLevel4DataError(null);

      try {
        const data = await level4Service.getUserModuleData(user.id, module.id);
        setLevel4Data(data);
      } catch (err) {
        setLevel4DataError(err instanceof Error ? err.message : 'Failed to load Level 4 data');
      } finally {
        setIsLoadingLevel4Data(false);
      }
    };

    fetchLevel4Data();
  }, [isOpen, module, user]);

  if (!isOpen || !module) return null;

  const getScoreIcon = (score: number): JSX.Element => {
    if (score >= 90) return <Trophy size={16} className="text-green-600" />;
    if (score >= 70) return <Target size={16} className="text-yellow-600" />;
    if (score > 0) return <Target size={16} className="text-orange-600" />;
    return <div className="w-4 h-4 rounded-full bg-gray-300"></div>;
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      isMobileLandscape ? 'p-1' : isMobile ? 'p-2' : 'p-4'
    }`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl shadow-2xl w-full transform transition-all duration-300 scale-100 ${
        isMobileLandscape ? 'max-w-sm mx-1 max-h-[85vh] overflow-hidden flex flex-col' :
        isMobile ? 'max-w-xs mx-2' : 'max-w-md'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b border-red-200 ${
          isMobileLandscape ? 'p-2' : isMobile ? 'p-3' : 'p-6'
        }`}>
          <div className={`flex items-center ${
            isMobileLandscape ? 'space-x-1.5' : isMobile ? 'space-x-2' : 'space-x-3'
          }`}>
            <div className={`bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
              isMobileLandscape ? 'w-6 h-6 text-xs' : isMobile ? 'w-8 h-8 text-sm' : 'w-12 h-12 text-lg'
            }`}>
              {module.id}
            </div>
            <div>
              <h2 className={`font-bold text-gray-800 ${
                isMobileLandscape ? 'text-sm' : isMobile ? 'text-lg' : 'text-xl'
              }`}>
                Module {module.id}
              </h2>

            </div>
          </div>
          <button
            onClick={onClose}
            className={`hover:bg-orange-200 rounded-full transition-colors duration-200 ${
              isMobileLandscape ? 'p-0.5' : isMobile ? 'p-1' : 'p-2'
            }`}
          >
            <X size={isMobileLandscape ? 14 : isMobile ? 16 : 20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className={`${
          isMobileLandscape ? 'p-2 overflow-y-auto flex-1' : isMobile ? 'p-3' : 'p-6'
        }`}>
          <h3 className={`font-semibold text-gray-800 flex items-center ${
            isMobileLandscape ? 'text-xs mb-2' : isMobile ? 'text-xs mb-3' : 'text-lg mb-4'
          }`}>
            <Target size={isMobileLandscape ? 14 : isMobile ? 16 : 20} className="mr-2 text-orange-500" />
            Level Progress
          </h3>

          <div className={isMobileLandscape ? 'space-y-1.5' : isMobile ? 'space-y-2' : 'space-y-3'}>
            {/* Level 1 Score for Modules 1-4 */}
            {[1,2,3,4].includes(module.id) && (
              <div className={`flex items-center justify-between bg-white rounded-lg shadow-sm border border-orange-100 hover:shadow-md transition-shadow duration-200 ${
                isMobileLandscape ? 'p-1.5' : isMobile ? 'p-2' : 'p-4'
              }`}>
                <div className={`flex items-center ${
                  isMobileLandscape ? 'space-x-1.5' : isMobile ? 'space-x-2' : 'space-x-3'
                }`}>
                  {getScoreIcon(level1Score ?? 0)}
                  <div>
                    <h4 className={`font-medium text-gray-800 ${
                      isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-base'
                    }`}>
                      Level 1
                    </h4>
                    {/* Show time below Level 1 */}
                    {level1Timer !== null && level1Score !== null && level1Score > 0 && (
                      <p className={`text-gray-500 mt-0.5 ${isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'}`}>
                        <span className="font-semibold">Time:</span> {Math.floor(level1Timer / 60)}:{(level1Timer % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  {level1Loading ? (
                    <span className={`text-gray-400 ${isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'}`}>Loading...</span>
                  ) : level1Error ? (
                    <span className={`text-red-500 ${isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'}`}>{level1Error}</span>
                  ) : (
                    <>
                      <div className={`font-bold ${
                        level1Score !== null && level1Score > 0 ? 'text-green-600' : 'text-red-500'
                      } ${isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-lg'}`}>
                        {level1Score !== null && level1Score > 0 ? 'Completed' : 'Not started'}
                      </div>
                      {/* Show score below completed/not started */}
                      {level1Score !== null && (
                        <div className={`text-gray-700 mt-0.5 ${isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'}`}>
                          <span className="font-semibold">Score:</span> {level1Score}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            {/* Other levels */}
            {module.levels?.map((level: Level) => (
              <div
                key={level.id}
                className={`flex items-center justify-between bg-white rounded-lg shadow-sm border border-orange-100 hover:shadow-md transition-shadow duration-200 ${
                  isMobileLandscape ? 'p-1.5' : isMobile ? 'p-2' : 'p-4'
                }`}
              >
                <div className={`flex items-center ${
                  isMobileLandscape ? 'space-x-1.5' : isMobile ? 'space-x-2' : 'space-x-3'
                }`}>
                  {getScoreIcon(level.score)}
                  <div>
                    <h4 className={`font-medium text-gray-800 ${
                      isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-base'
                    }`}>
                      {level.name}
                    </h4>
                    <p className={`text-gray-500 ${
                      isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      Level {level.id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-gray-600 ${
                    isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-lg'
                  }`}>
                    {level.score > 0 ? 'Completed' : 'Not started'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Level 2 Game Data Section - Only show for Module 1 */}
          {[1, 2, 3, 4].includes(module.id) && (
            <>
              <div className={`mt-4 ${isMobileLandscape ? 'mt-3' : isMobile ? 'mt-4' : 'mt-6'}`}>
                {isLoadingData ? (
                  <div className={`flex items-center justify-center bg-white rounded-lg shadow-sm border border-blue-100 ${
                    isMobileLandscape ? 'p-2' : isMobile ? 'p-3' : 'p-4'
                  }`}>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className={`ml-2 text-gray-600 ${
                      isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      Loading game data...
                    </span>
                  </div>
                ) : dataError ? (
                  <div className={`bg-red-50 rounded-lg shadow-sm border border-red-200 ${
                    isMobileLandscape ? 'p-2' : isMobile ? 'p-3' : 'p-4'
                  }`}>
                    <p className={`text-red-600 ${
                      isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      Error: {dataError}
                    </p>
                  </div>
                ) : level2Data.length === 0 ? (
                  <div className={`bg-gray-50 rounded-lg shadow-sm border border-gray-200 ${
                    isMobileLandscape ? 'p-2' : isMobile ? 'p-3' : 'p-4'
                  }`}>
                    <p className={`text-gray-600 ${
                      isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      No Level 2 data found.
                    </p>
                  </div>
                ) : level2Data.length > 0 ? (
                  <div className={`bg-white rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-200 ${
                    isMobileLandscape ? 'p-1.5' : isMobile ? 'p-2' : 'p-4'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center ${
                        isMobileLandscape ? 'space-x-1.5' : isMobile ? 'space-x-2' : 'space-x-3'
                      }`}>
                        <div>
                          <h4 className={`font-medium text-gray-800 ${
                            isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-base'
                          }`}>
                            Level 2
                          </h4>
                          <p className={`text-gray-500 ${
                            isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            {/* Classification Game */}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${level2Data.some(data => data.is_completed) ? 'text-green-600' : 'text-gray-600'} ${
                          isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-lg'
                        }`}>
                          {level2Data.some(data => data.is_completed) ? 'Completed' : 'In Progress'}
                        </div>
                        <div className={`text-gray-500 ${
                          isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                        }`}>
                          Score: {Math.max(...level2Data.map(data => data.score))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}

          {/* Level 3 Game Data Section - Show for modules that support Level 3 */}
          {[1, 2, 3, 4].includes(module.id) && (
            <>
              <div className={`mt-4 ${isMobileLandscape ? 'mt-3' : isMobile ? 'mt-4' : 'mt-6'}`}>
                {isLoadingLevel3Data ? (
                  <div className={`flex items-center justify-center bg-white rounded-lg shadow-sm border border-green-100 ${
                    isMobileLandscape ? 'p-2' : isMobile ? 'p-3' : 'p-4'
                  }`}>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                    <span className={`ml-2 text-gray-600 ${
                      isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      Loading Level 3 data...
                    </span>
                  </div>
                ) : level3DataError ? (
                  <div className={`bg-red-50 rounded-lg shadow-sm border border-red-200 ${
                    isMobileLandscape ? 'p-2' : isMobile ? 'p-3' : 'p-4'
                  }`}>
                    <p className={`text-red-600 ${
                      isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      Error: {level3DataError}
                    </p>
                  </div>
                ) : level3Data.length === 0 ? (
                  <div className={`bg-gray-50 rounded-lg shadow-sm border border-gray-200 ${
                    isMobileLandscape ? 'p-2' : isMobile ? 'p-3' : 'p-4'
                  }`}>
                    <p className={`text-gray-600 ${
                      isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      No Level 3 data found.
                    </p>
                  </div>
                ) : level3Data.length > 0 ? (
                  <div className={`bg-white rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-200 ${
                    isMobileLandscape ? 'p-1.5' : isMobile ? 'p-2' : 'p-4'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center ${
                        isMobileLandscape ? 'space-x-1.5' : isMobile ? 'space-x-2' : 'space-x-3'
                      }`}>
                        <div>
                          <h4 className={`font-medium text-gray-800 ${
                            isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-base'
                          }`}>
                            Level 3
                          </h4>
                          <p className={`text-gray-500 ${
                            isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            {/* Jigsaw Puzzle */}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${level3Data.length > 0 ? 'text-green-600' : 'text-gray-600'} ${
                          isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-lg'
                        }`}>
                          {level3Data.length > 0 ? 'Completed' : 'Not started'}
                        </div>
                        <div className={`text-gray-500 ${
                          isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                        }`}>
                          Score: {level3Data.length > 0 ? Math.round(level3Data.reduce((acc, data) => acc + (data.total_score / data.total_scenarios), 0) / level3Data.length) : 0}
                        </div>
                        {level3Data.length > 0 && (
                          <div className={`text-gray-500 ${
                            isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            {/* Sessions: {level3Data.length} */}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}

          {/* Level 4 Game Data Section - Show for modules that support Level 4 */}
          {[1, 2, 3, 4].includes(module.id) && (
            <>
              <div className={`mt-4 ${isMobileLandscape ? 'mt-3' : isMobile ? 'mt-4' : 'mt-6'}`}>
                {/* <h3 className={`font-semibold text-gray-800 flex items-center mb-3 ${
                  isMobileLandscape ? 'text-xs mb-2' : isMobile ? 'text-xs mb-3' : 'text-lg mb-4'
                }`}>
                  <Target size={isMobileLandscape ? 14 : isMobile ? 16 : 20} className="mr-2 text-purple-500" />
                  Level 4 Progress
                </h3> */}

                {isLoadingLevel4Data ? (
                  <div className={`flex items-center justify-center bg-white rounded-lg shadow-sm border border-purple-100 ${
                    isMobileLandscape ? 'p-2' : isMobile ? 'p-3' : 'p-4'
                  }`}>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                    <span className={`ml-2 text-gray-600 ${
                      isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      Loading Level 4 data...
                    </span>
                  </div>
                ) : level4DataError ? (
                  <div className={`bg-red-50 rounded-lg shadow-sm border border-red-200 ${
                    isMobileLandscape ? 'p-2' : isMobile ? 'p-3' : 'p-4'
                  }`}>
                    <p className={`text-red-600 ${
                      isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      Error: {level4DataError}
                    </p>
                  </div>
                ) : !level4Data ? (
                  <div className={`bg-gray-50 rounded-lg shadow-sm border border-gray-200 ${
                    isMobileLandscape ? 'p-2' : isMobile ? 'p-3' : 'p-4'
                  }`}>
                    <p className={`text-gray-600 ${
                      isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      No Level 4 data found for Module {module.id}
                    </p>
                  </div>
                ) : (
                  <div className={`bg-white rounded-lg shadow-sm border border-purple-100 hover:shadow-md transition-shadow duration-200 ${
                    isMobileLandscape ? 'p-1.5' : isMobile ? 'p-2' : 'p-4'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center ${
                        isMobileLandscape ? 'space-x-1.5' : isMobile ? 'space-x-2' : 'space-x-3'
                      }`}>
                        {/* {getScoreIcon(level4Data.score)} */}
                        <div>
                          <h4 className={`font-medium text-gray-800 ${
                            isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-base'
                          }`}>
                            {/* Module {level4Data.module} - Level {level4Data.level} */}
                            Level {level4Data.level}
                          </h4>
                          <p className={`text-gray-500 ${
                            isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            {/* Case-based Learning */}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${level4Data.is_completed ? 'text-green-600' : 'text-gray-600'} ${
                          isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-lg'
                        }`}>
                          {level4Data.is_completed ? 'Completed' : 'In Progress'}
                        </div>
                        <div className={`text-gray-500 ${
                          isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                        }`}>
                          Score: {level4Data.score}
                        </div>
                        {/* {level4Data.time > 0 && (
                          <div className={`text-gray-500 ${
                            isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            Time: {Math.floor(level4Data.time / 60)}:{(level4Data.time % 60).toString().padStart(2, '0')}
                          </div>
                        )} */}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
       {
        !isMobileLandscape && !isMobile &&
        <div className={`bg-gradient-to-r from-orange-100 to-amber-100 rounded-b-2xl border-t border-orange-200 ${
          isMobile ? 'px-3 py-3' : 'px-6 py-4'
        }`}>
          <div className="flex justify-between items-center">
            <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Status: <span className="font-medium capitalize text-gray-800">{module.status}</span>
            </div>
            <button
              onClick={onClose}
              className={`bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md ${
                isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
              }`}
            >
              Close
            </button>
          </div>
        </div>
        }
      </div>
    </div>
  );
};

export default ModuleDetailModal;