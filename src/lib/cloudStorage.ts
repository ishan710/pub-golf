import { supabase, TeamScoreRecord, PhotoRecord } from './supabase';

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
 * Save photo metadata to photos table
 */
export async function savePhotoRecord(
  gameId: string,
  barId: string,
  barName: string,
  photoUrl: string
): Promise<boolean> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured');
      return false;
    }

    const photoData: PhotoRecord = {
      game_id: gameId,
      bar_id: barId,
      bar_name: barName,
      photo_url: photoUrl,
      timestamp: Date.now(),
    };

    const { error } = await supabase
      .from('photos')
      .insert([photoData]);

    if (error) {
      console.error('Error saving photo record:', error);
      return false;
    }

    console.log('✅ Photo saved to database!');
    return true;
  } catch (error) {
    console.error('Error saving photo:', error);
    return false;
  }
}

/**
 * Get all photos
 */
export async function getAllPhotos(limit: number = 50): Promise<PhotoRecord[]> {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
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
 * Get photos for a specific game
 */
export async function getGamePhotos(gameId: string): Promise<PhotoRecord[]> {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('game_id', gameId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching game photos:', error);
    return [];
  }
}
