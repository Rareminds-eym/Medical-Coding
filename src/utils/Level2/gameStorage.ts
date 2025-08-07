// Game storage utility for managing scores and progress
export interface GameStats {
  highScore: number;
  totalGamesPlayed: number;
  bestTime: number;
  lastPlayedDate: string;
  perfectGames: number;
}

export interface TermPlacementResult {
  termId: string;
  termText: string;
  correctCategory: string;
  placedCategory: string;
  isCorrect: boolean;
  timestamp: number;
  moduleId: string;
  gameModeId: string;
  type: string;
}

export class GameStorage {
  private static readonly STORAGE_KEY = 'gmp-quest-stats';
  private static readonly TERM_PLACEMENT_KEY_PREFIX = 'term-placement';

  public static getStats(): GameStats {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Error loading game stats:', error);
    }

    // Return default stats
    return {
      highScore: 0,
      totalGamesPlayed: 0,
      bestTime: 0,
      lastPlayedDate: '',
      perfectGames: 0
    };
  }

  public static saveStats(stats: GameStats): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.warn('Error saving game stats:', error);
    }
  }

  public static updateScore(newScore: number, timeElapsed: number, isPerfect: boolean = false): GameStats {
    const currentStats = this.getStats();
    
    const updatedStats: GameStats = {
      highScore: Math.max(currentStats.highScore, newScore),
      totalGamesPlayed: currentStats.totalGamesPlayed + 1,
      bestTime: currentStats.bestTime === 0 ? timeElapsed : Math.min(currentStats.bestTime, timeElapsed),
      lastPlayedDate: new Date().toISOString(),
      perfectGames: currentStats.perfectGames + (isPerfect ? 1 : 0)
    };

    this.saveStats(updatedStats);
    return updatedStats;
  }

  public static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Term placement methods
  private static getTermPlacementKey(moduleId: string, gameModeId: string, type: string): string {
    return `${this.TERM_PLACEMENT_KEY_PREFIX}-${moduleId}-${gameModeId}-${type}`;
  }

  public static getTermPlacementResults(moduleId: string, gameModeId: string, type: string): TermPlacementResult[] {
    try {
      const key = this.getTermPlacementKey(moduleId, gameModeId, type);
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Error loading term placement results:', error);
    }
    return [];
  }

  public static saveTermPlacementResult(result: TermPlacementResult): void {
    try {
      const key = this.getTermPlacementKey(result.moduleId, result.gameModeId, result.type);
      const existing = this.getTermPlacementResults(result.moduleId, result.gameModeId, result.type);
      
      // Remove any existing result for the same term
      const filtered = existing.filter(r => r.termId !== result.termId);
      
      // Add the new result
      filtered.push(result);
      
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.warn('Error saving term placement result:', error);
    }
  }

  public static clearTermPlacementResults(moduleId: string, gameModeId: string, type: string): void {
    try {
      const key = this.getTermPlacementKey(moduleId, gameModeId, type);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Error clearing term placement results:', error);
    }
  }

  public static clearAllTermPlacementResults(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.TERM_PLACEMENT_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Error clearing all term placement results:', error);
    }
  }

  public static clearLegacyLevel2GameStates(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        // Clear any legacy keys that might conflict
        if (key.includes('level2-game-state') || key.includes('game-state')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Error clearing legacy game states:', error);
    }
  }

  public static clearAllLevel2GameStatesForModule(moduleId: string): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes(`-${moduleId}-`) && (key.includes('level2') || key.includes('game-state'))) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Error clearing module game states:', error);
    }
  }

  public static clearQuestStats(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Error clearing quest stats:', error);
    }
  }

  public static forceClearQuestStats(): void {
    try {
      // Force clear by setting to null and removing
      localStorage.setItem(this.STORAGE_KEY, '');
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Error force clearing quest stats:', error);
    }
  }

  public static listAllRelevantKeys(): void {
    try {
      const keys = Object.keys(localStorage);
      const relevantKeys = keys.filter(key => 
        key.includes('gmp-quest') || 
        key.includes('term-placement') || 
        key.includes('level2') || 
        key.includes('game-state')
      );
      console.log('Relevant localStorage keys:', relevantKeys);
    } catch (error) {
      console.warn('Error listing localStorage keys:', error);
    }
  }
}