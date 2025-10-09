# Supabase Cloud Storage Setup

## Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up for a free account
3. Create a new project

## Step 2: Create Database Tables
Go to SQL Editor in Supabase and run this:

```sql
-- Create team_scores table
CREATE TABLE team_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id TEXT NOT NULL,
  game_name TEXT NOT NULL,
  bar_id TEXT NOT NULL,
  bar_name TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  players JSONB NOT NULL,
  bonus_completed BOOLEAN DEFAULT false,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create photos table
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id TEXT NOT NULL,
  bar_id TEXT NOT NULL,
  bar_name TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_team_scores_game_id ON team_scores(game_id);
CREATE INDEX idx_team_scores_timestamp ON team_scores(timestamp);
CREATE INDEX idx_photos_game_id ON photos(game_id);
CREATE INDEX idx_photos_timestamp ON photos(timestamp DESC);

-- Enable Row Level Security (optional, for public read)
ALTER TABLE team_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read scores
CREATE POLICY "Allow public read access" ON team_scores
  FOR SELECT USING (true);

-- Allow anyone to insert scores
CREATE POLICY "Allow public insert access" ON team_scores
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read photos
CREATE POLICY "Allow public read photos" ON photos
  FOR SELECT USING (true);

-- Allow anyone to insert photos
CREATE POLICY "Allow public insert photos" ON photos
  FOR INSERT WITH CHECK (true);
```

## Step 3: Create Storage Bucket
1. Go to Storage in Supabase dashboard
2. Click "Create Bucket"
3. Name it: `team-photos`
4. Make it **Public** (so photos can be viewed)
5. Click Create

## Step 4: Set Storage Policies
Go to Storage > team-photos > Policies and add:

```sql
-- Allow public uploads
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'team-photos');

-- Allow public reads
CREATE POLICY "Allow public reads" ON storage.objects FOR SELECT
  USING (bucket_id = 'team-photos');
```

## Step 5: Get Your API Keys
1. Go to Settings > API
2. Copy these values:
   - Project URL (starts with https://xxxxx.supabase.co)
   - anon/public key

## Step 6: Add Environment Variables
Create/update `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 7: Restart Dev Server
```bash
npm run dev
```

## Usage

The app will now automatically:
- ✅ Upload photos to Supabase Storage (cloud)
- ✅ Save team scores to Supabase Database (cloud)
- ✅ Retrieve scores and photos from cloud
- ✅ Everything is backed up and accessible from anywhere!

## Free Tier Limits
- Database: 500 MB
- Storage: 1 GB
- Bandwidth: 2 GB/month
- Good for ~500-1000 games with photos!

