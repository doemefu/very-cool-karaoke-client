export interface SongAddedBy {
  id: number;
  username: string;
  status: string;
}

export interface Song {
  id: number;
  spotifyId: string | null;
  geniusId: string | null;
  title: string;
  artist: string;
  /**
   * Full lyrics text returned by the backend.
   * null  → backend has no lyrics for this song (show "not available" message)
   * string → display in the scrollable lyrics block
   */
  lyrics: string | null;
  albumArt: string | null;
  currentVoteCount: number;
  performed: boolean;
  durationMs: number | null;
}

/** Lightweight DTO returned by GET /songs/search — not a full playlist entry. */
export interface SongSearchResult {
  spotifyId: string;
  title: string;
  artist: string;
  albumArt: string | null;
  durationMs: number;
  lyricsAvailable: boolean;
}