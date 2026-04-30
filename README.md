# Karaokee – Client

> Remove the shame, enhance the game by making karaoke parties hustle-free.

Karaokee is a web-based karaoke session tool for real-time multi-user interaction.
A host creates a session that guests join from their own device. Participants collaboratively
build a song queue, vote on the next track, follow lyrics on-screen, and send live reactions
during performances.

---

## Overview

**Karaokee** lets users host and join live karaoke sessions. The host picks songs from a shared queue, and every participant sees synchronized lyrics in real time — no extra setup needed.

---

## Features

| Feature | Description |
|---|---|
| **Session Management** | Create or join sessions using a Game PIN |
| **YouTube Playback** | Host plays music via YouTube — songs are searched automatically by title and artist |
| **Real-Time Lyrics** | Lyrics are pushed to all participants over WebSocket (STOMP) |
| **Song Queue** | Any participant can search and add songs to the shared queue |
| **Reactions** | Live emoji reactions during playback |
| **User Accounts** | Register, log in, change password, view profiles |
| **Role-Based UI** | Hosts get extra controls (skip, manage queue); guests just watch and react |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | [Ant Design 6](https://ant.design/) |
| Real-Time | [STOMP.js](https://stomp-js.github.io/) over SockJS WebSocket |
| Music | [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) + YouTube Data API v3 |
| Runtime | Node.js / [Deno](https://deno.com/) |
| Deployment | Docker + GitHub Actions → DockerHub |

---

## Getting Started

### Prerequisites

- Node.js or Deno installed, **or** use the automated setup below
- A [YouTube Data API v3 key](https://console.cloud.google.com/) (required for the host role)

### Quick Setup (macOS / Linux / WSL)

```bash
git clone https://github.com/doemefu/very-cool-karaoke-client
cd very-cool-karaoke-client
source setup.sh
```

> **Windows users:** Run `windows.ps1` with admin privileges first to install WSL, then follow the steps above in a WSL terminal.

### Run the Dev Server

```bash
npm run dev
```

Open [http://127.0.0.1:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
app/
├── components/          # Shared UI components
│   ├── LyricsDisplay    # Real-time lyrics view
│   ├── ReactionBar      # Live emoji reactions
│   ├── SongSearchDrawer # Song search
│   └── YouTubePlayer    # YouTube playback (admin only)
├── context/             # React contexts (STOMP)
├── hooks/               # Custom hooks (lyrics, queue, playback, …)
├── sessions/[sessionId] # Live karaoke session page
├── dashboard/           # User dashboard
├── change-password/     # Change User Password   
├── create-session/      # Host flow
└── join-session/        # Guest flow
```

---

## Contributing

See [contributions.md](./contributions.md) for team contribution guidelines.

---

## License

This project was created as part of the Software Engineering course at the University of Zurich (SoPra FS26).
