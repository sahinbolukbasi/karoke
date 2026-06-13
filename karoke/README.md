# Neon Stage Karaoke

Modern and artistic karaoke platform built with Next.js and Tailwind CSS.

## What Is Included

- Lobby management with participant queue and reorder actions
- Spotify login and track search
- Spotify Web Playback SDK initialization and playback trigger
- Karaoke-style lyrics flow synced to elapsed song time
- Web Bluetooth device connection panel for mic or speaker pairing
- Web Audio API microphone analysis with fun scoring output
- Animated, glassmorphism, colorful UI for karaoke-night atmosphere

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4
- Framer Motion
- Spotify Web API + Web Playback SDK
- Web Audio API
- Web Bluetooth API

## Local Development

1. Install dependencies:

	npm install

2. Copy environment file and fill values:

	cp .env.example .env.local

3. Start dev server:

	npm run dev

4. Open:

	http://localhost:3000

## Spotify Configuration

In your Spotify Developer dashboard app settings:

- Add redirect URI for local usage: http://localhost:3000
- Add redirect URI for GitHub Pages:
  https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME

Set these values in .env.local:

- NEXT_PUBLIC_SPOTIFY_CLIENT_ID
- NEXT_PUBLIC_SPOTIFY_REDIRECT_URI

## GitHub Pages Deployment

Project is configured for static export and GitHub Pages.

1. Push project to GitHub (main branch).
2. In repository settings, enable Pages and set Source to GitHub Actions.
3. Add repository Variables:
	- NEXT_PUBLIC_SPOTIFY_CLIENT_ID
	- NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
4. Workflow file is ready at .github/workflows/deploy.yml.
5. Every push to main triggers build and deploy.

## Notes

- Spotify playback through Web Playback SDK generally requires Spotify Premium.
- Web Bluetooth support depends on browser and secure context (HTTPS).
- Scoring algorithm is intentionally playful; you can replace it with advanced pitch detection later.
