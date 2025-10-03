import { supabase, TeamScoreRecord } from './supabase';

/**
 * Upload team photo to Supabase Storage
 */
export async function uploadTeamPhoto(
  file: File,
  gameId: string,
  barId: string
): Promise<string | null> {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, skipping photo upload');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${gameId}/${barId}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('team-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase storage error:', error);
      // Don't fail the whole submission if photo upload fails
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('team-photos')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading photo:', error);
    return null;
  }
}

/**
 * Save team score to Supabase Database
 */
export async function saveTeamScore(
  gameId: string,
  gameName: string,
  barId: string,
  barName: string,
  players: { name: string; sips: number }[],
  bonusCompleted: boolean,
  photoUrl?: string
): Promise<boolean> {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, skipping cloud save');
      return true; // Don't block the game
    }

    const scoreData: TeamScoreRecord = {
      game_id: gameId,
      game_name: gameName,
      bar_id: barId,
      bar_name: barName,
      timestamp: Date.now(),
      players,
      bonus_completed: bonusCompleted,
      photo_url: photoUrl,
    };

    const { error } = await supabase
      .from('team_scores')
      .insert([scoreData]);

    if (error) {
      console.error('Supabase database error:', error);
      return true; // Don't block the game
    }

    console.log('✅ Team score saved to cloud!');
    return true;
  } catch (error) {
    console.error('Error saving team score:', error);
    return true; // Don't block the game
  }
}

/**
 * Get all scores for a game
 */
export async function getGameScores(gameId: string): Promise<TeamScoreRecord[]> {
  try {
    const { data, error } = await supabase
      .from('team_scores')
      .select('*')
      .eq('game_id', gameId)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching game scores:', error);
    return [];
  }
}

/**
 * Get recent photos from all games
 */
export async function getRecentPhotos(limit: number = 20): Promise<TeamScoreRecord[]> {
  try {
    const { data, error } = await supabase
      .from('team_scores')
      .select('*')
      .not('photo_url', 'is', null)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
}

/**
 * Get live leaderboard - teams with lowest scores
 */
export async function getLiveLeaderboard(): Promise<{
  gameName: string;
  gameId: string;
  players: string[];
  totalScore: number;
  holesPlayed: number;
}[]> {
  try {
    const { data, error } = await supabase
      .from('team_scores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by game
    const gameMap = new Map<string, TeamScoreRecord[]>();
    data?.forEach(score => {
      if (!gameMap.has(score.game_id)) {
        gameMap.set(score.game_id, []);
      }
      gameMap.get(score.game_id)!.push(score);
    });

    // Calculate totals per game
    const leaderboard = Array.from(gameMap.entries()).map(([gameId, scores]) => {
      const gameName = scores[0]?.game_name || 'Unknown';
      const allPlayers = new Set<string>();
      let totalScore = 0;

      scores.forEach(score => {
        score.players.forEach(p => {
          allPlayers.add(p.name);
          totalScore += p.sips;
          if (score.bonus_completed) {
            totalScore -= 1; // Bonus reduces score
          }
        });
      });

      return {
        gameId,
        gameName,
        players: Array.from(allPlayers),
        totalScore,
        holesPlayed: scores.length,
      };
    });

    // Sort by lowest score (best in golf)
    return leaderboard.sort((a, b) => a.totalScore - b.totalScore);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Get all games
 */
export async function getAllGames(): Promise<{ game_id: string; game_name: string; created_at: string }[]> {
  try {
    const { data, error } = await supabase
      .from('team_scores')
      .select('game_id, game_name, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get unique games
    const uniqueGames = data?.reduce((acc: any[], curr) => {
      if (!acc.find(g => g.game_id === curr.game_id)) {
        acc.push(curr);
      }
      return acc;
    }, []);

    return uniqueGames || [];
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}
