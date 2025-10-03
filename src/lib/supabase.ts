import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface TeamScoreRecord {
  id?: string;
  game_id: string;
  game_name: string;
  bar_id: string;
  bar_name: string;
  timestamp: number;
  players: {
    name: string;
    sips: number;
  }[];
  bonus_completed: boolean;
  photo_url?: string;
  created_at?: string;
}

