import { TeamScore } from '@/types/backend';

export async function saveTeamScore(teamScore: TeamScore) {
  try {
    const response = await fetch('/api/save-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamScore),
    });

    if (!response.ok) {
      throw new Error('Failed to save score');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving team score:', error);
    throw error;
  }
}

export async function uploadTeamPhoto(file: File, gameId: string, barId: string) {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('gameId', gameId);
    formData.append('barId', barId);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.photoUrl;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}

export async function getGameScores(gameId?: string) {
  try {
    const url = gameId ? `/api/save-score?gameId=${gameId}` : '/api/save-score';
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch scores');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching scores:', error);
    throw error;
  }
}

