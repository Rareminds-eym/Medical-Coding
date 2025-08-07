import { supabase } from '../lib/supabase';

export interface GameUnlockStatus {
  id: number;
  created_at: string;
  is_lock: boolean;
}

export class GameUnlockService {
  /**
   * Check if the game is locked by querying the game_unlock table
   * @param userEmail - Optional user email to check for user-specific unlock status
   * @returns Promise<boolean> - true if game is locked, false if unlocked
   */
  static async isGameLocked(userEmail?: string): Promise<boolean> {
    try {
      // Special case: unlock for users with @rareminds.in email
      if (userEmail && userEmail.endsWith("@rareminds.in")) {
        console.log('🔓 Special unlock for user:', userEmail);
        return false;
      }
      
      const { data, error } = await supabase
        .from('game_unlock')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Default to locked if there's an error
        return true;
      }

      const isLocked = data?.is_lock ?? true;
      
      return isLocked;
    } catch (error) {
      // Default to locked if there's an error
      return true;
    }
  }

  /**
   * Get the full game unlock status record
   * @returns Promise<GameUnlockStatus | null>
   */
  static async getGameUnlockStatus(): Promise<GameUnlockStatus | null> {
    try {
      const { data, error } = await supabase
        .from('game_unlock')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        
        return null;
      }

      return data;
    } catch (error) {
      
      return null;
    }
  }

  /**
   * Update the game lock status (admin function)
   * @param isLocked - true to lock the game, false to unlock
   * @returns Promise<boolean> - success status
   */
  static async updateGameLockStatus(isLocked: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('game_unlock')
        .insert({
          is_lock: isLocked,
          created_at: new Date().toISOString()
        });

      if (error) {
        
        return false;
      }

      return true;
    } catch (error) {
      
      return false;
    }
  }
}