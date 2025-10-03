import { NextRequest, NextResponse } from 'next/server';
import { TeamScore } from '@/types/backend';

// In-memory storage (replace with a real database like Supabase, MongoDB, etc.)
const scores: TeamScore[] = [];

export async function POST(req: NextRequest) {
  try {
    const teamScore: TeamScore = await req.json();
    
    // Validate data
    if (!teamScore.gameName || !teamScore.barId || !teamScore.players) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store the score
    scores.push(teamScore);

    return NextResponse.json({
      success: true,
      message: 'Score saved successfully',
      data: teamScore
    });
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');

    if (gameId) {
      const gameScores = scores.filter(s => s.gameName === gameId);
      return NextResponse.json({ success: true, data: gameScores });
    }

    return NextResponse.json({ success: true, data: scores });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    );
  }
}

