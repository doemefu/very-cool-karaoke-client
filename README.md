# Karaokee – Client

> Remove the shame, enhance the game by making karaoke parties hustle-free.

## Introduction

Karaokee is a web-based karaoke platform that turns any gathering into a collaborative music experience. A host creates a session and shares a PIN; guests join from their own device, add songs to a shared queue, vote on what plays next, and follow synchronized lyrics in real time — no app install or extra hardware required.

---

## Features

| Feature | Description |
|---|---|
| **Session Management** | Create or join sessions using a Game PIN |
| **YouTube Playback** | Host plays music via YouTube — songs are searched automatically by title and artist |
| **Real-Time Lyrics** | Lyrics are pushed to all participants over WebSocket (STOMP) |
| **Song Queue** | Any participant can search and add songs to the shared queue |
| **Voting** | Participants vote on which song plays next; live counts update in real time |
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
| Deployment | Docker + GitHub Actions → DockerHub → Vercel |

---

## High-Level Components

### 1. [StompContext](app/context/StompContext.tsx)
Manages the single persistent WebSocket (STOMP over SockJS) connection for the entire app. It authenticates with the stored user token, handles automatic reconnection, and exposes `useStomp()` so any component can subscribe to real-time topics (lyrics, queue, reactions, voting) without managing its own socket.

### 2. [SessionPage](app/sessions/%5BsessionId%5D/page.tsx)
The core of the application. Orchestrates the full in-session experience by composing `LyricsDisplay`, `VotingPhase`, `SongSearchDrawer`, `ReactionBar`, and `YouTubePlayer`. It drives the session state machine (CREATED → ACTIVE → PAUSED → ENDED) and provides admin controls (start, pause, skip, end session).

### 3. [LyricsDisplay](app/components/LyricsDisplay.tsx)
Renders the synchronized lyrics view shown to all participants. Receives the current song via the `useLyrics` hook, which subscribes to the backend WebSocket topic so lyrics update simultaneously for everyone in the session.

### 4. [VotingPhase](app/components/VotingPhase.tsx)
Handles the full voting flow: displays candidate songs, lets users cast a vote, and shows live vote counts updating in real time via WebSocket. When an open voting round is active, `SessionPage` replaces the normal view with this component. The winner is announced when the round closes.

### 5. [SongSearchDrawer](app/components/SongSearchDrawer.tsx)
A slide-in panel that lets any participant search the catalog and add songs to the shared session queue. The host can also remove songs from the queue. Internally wraps `SongSearchContent`, which is also reused in the mandatory song-selection step during join.

---

## Launch & Deployment

### Prerequisites

- Node.js or Deno installed, **or** use the automated setup below
- A [YouTube Data API v3 key](https://console.cloud.google.com/) (required for the host role) — set it before running the dev server:
  ```bash
  # Option A – permanent: create a .env.local file in the project root
  echo "NEXT_PUBLIC_YOUTUBE_API_KEY=your_key_here" >> .env.local

  # Option B – one-off: export it in your terminal session
  export NEXT_PUBLIC_YOUTUBE_API_KEY=your_key_here
  ```
- The **backend server** must be running — see the [server repository](https://github.com/doemefu/very-cool-karaoke-server)

### Quick Setup (macOS / Linux / WSL)

```bash
git clone https://github.com/doemefu/very-cool-karaoke-client
cd very-cool-karaoke-client
source setup.sh
```

> **Windows users:** Run `windows.ps1` with admin privileges first to install WSL, then follow the steps above in a WSL terminal.

### Run the Dev Server

```bash
npm install
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

## Illustrations

<!-- TODO: add screenshots -->

**Host:** Register → Create Session → get a PIN → waiting lobby → Start the Party → manage queue / trigger votes → End Session → Review screen.

**Guest:** Log in → Join Session → enter PIN → add a song to the queue → watch lyrics, react, vote → Review screen.

---

## Roadmap

Top features new contributors could add:

1. **Synchronized lyrics highlighting** — highlight the current word or line in real time as the song plays, so participants always know exactly where they are in the lyrics.

2. **Karaoke song versions** — integrate an instrumental/karaoke track source so the vocals are removed, making it a true sing-along experience rather than singing over the original recording.

3. **Multi-device audio** — allow all participants' devices to play the audio simultaneously so the sound fills the room, rather than only the host's device acting as the speaker.

---

## Authors & Acknowledgment

| GitHub | Contributions |
|---|---|
| [@doemefu](https://github.com/doemefu) | Backend lead, DevOps, lyrics & Spotify integration |
| [@Oskar-567](https://github.com/Oskar-567) | Frontend, WebSocket setup, song search, reactions |
| [@Spring987](https://github.com/Spring987) | Frontend, session join/create, voting UI, admin controls |
| [@Unick1](https://github.com/Unick1) | Backend, queue & participant tracking, WebSocket broadcasting |
| [@lurisz33](https://github.com/lurisz33) | Backend, user auth, voting logic, song endpoints |

Built as part of the **Software Engineering Lab (SoPra FS26)** at the University of Zurich.  
Template by the [SoPra team at UZH](https://github.com/HASEL-UZH/sopra-fs26-template-client).  
For contribution guidelines see [contributions.md](./contributions.md).

---

## License

This project was created as part of the Software Engineering course at the University of Zurich (SoPra FS26).  
Licensed under the [MIT License](LICENSE). <!-- TODO: confirm license with team -->
