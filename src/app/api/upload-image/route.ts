import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('photo') as File;
    const gameId = formData.get('gameId') as string;
    const barId = formData.get('barId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const filename = `${gameId}_${barId}_${Date.now()}.${file.type.split('/')[1]}`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

    // Save file
    await writeFile(filepath, buffer);

    // Return URL
    const photoUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      photoUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

