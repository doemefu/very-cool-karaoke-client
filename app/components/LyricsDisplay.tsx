"use client";

import { FC } from "react";
import { Song } from "@/types/song";
import { Spin, Typography } from "antd";

const { Title, Text, Paragraph } = Typography;

// Props
interface LyricsDisplayProps {
  currentSong: Song | null;
  isLoading: boolean;
  fetchError: string | null;
}

// Shared style for centered state containers
const centeredStateStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: 420,
};

// State sub-components

const LoadingState: FC = () => (
  <div style={{ ...centeredStateStyle, gap: 16 }}>
    <Spin size="large" />
    <Text style={{ color: "#00C2FF", fontSize: 14 }}>
      Loading current song…
    </Text>
  </div>
);

const ErrorState: FC<{ message: string }> = ({ message }) => (
  <div style={{ ...centeredStateStyle, gap: 12, padding: "0 32px" }}>
    <span style={{ fontSize: 40 }}>⚠️</span>
    <Text style={{ color: "#FF2D7E", fontSize: 16, textAlign: "center" }}>
      {message}
    </Text>
  </div>
);

const NoSongState: FC = () => (
  <div style={{ ...centeredStateStyle, gap: 12 }}>
    <span style={{ fontSize: 56 }}>🎤</span>
    <Text
      style={{
        color: "#00C2FF",
        fontSize: 18,
        fontWeight: 500,
        textAlign: "center",
      }}
    >
      No song currently playing
    </Text>
    <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
      The host will start the session shortly…
    </Text>
  </div>
);

/**
 * Show "Lyrics not available for this song" message
 * when song.lyrics === null.
 */
const LyricsNotAvailableState: FC = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "64px 32px",
      gap: 16,
    }}
  >
    <span style={{ fontSize: 40, opacity: 0.5 }}>🎵</span>
    <Text
      style={{
        color: "rgba(255,255,255,0.55)",
        fontSize: 18,
        textAlign: "center",
        fontStyle: "italic",
      }}
    >
      Lyrics not available for this song
    </Text>
    <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
      Sing along from memory — you&apos;ve got this! 🎤
    </Text>
  </div>
);

const SongHeader: FC<{ title: string; artist: string }> = ({
  title,
  artist,
}) => (
  <div
    style={{
      textAlign: "center",
      padding: "32px 24px 20px",
      borderBottom: "1px solid rgba(255,45,126,0.15)",
    }}
  >
    <Title
      level={2}
      style={{
        color: "#FFFFFF",
        marginBottom: 6,
        fontWeight: 700,
        fontSize: 26,
      }}
    >
      {title}
    </Title>
    <Text
      style={{
        color: "#00C2FF",
        fontSize: 17,
        fontWeight: 400,
        display: "block",
      }}
    >
      {artist}
    </Text>
  </div>
);

/**
 * Static scrollable lyrics block.
 * TBD: auto-scroll lyrics.
 */
const LyricsBlock: FC<{ lyrics: string }> = ({ lyrics }) => (
  <div
    style={{
      height: "65vh",
      overflowY: "auto",
      padding: "24px 40px 40px",
      scrollbarWidth: "thin",
      scrollbarColor: "#FF2D7E transparent",
    }}
  >
    <Paragraph
      style={{
        color: "rgba(255,255,255,0.90)",
        fontSize: 18,
        lineHeight: 2.1,
        whiteSpace: "pre-line",
        textAlign: "center",
        margin: 0,
        letterSpacing: "0.015em",
      }}
    >
      {lyrics}
    </Paragraph>
  </div>
);

// Main export

const LyricsDisplay: FC<LyricsDisplayProps> = ({
  currentSong,
  isLoading,
  fetchError,
}) => {
  if (isLoading) return <LoadingState />;
  if (fetchError) return <ErrorState message={fetchError} />;
  if (!currentSong) return <NoSongState />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <SongHeader title={currentSong.title} artist={currentSong.artist} />
      {currentSong.lyrics === null ? (
        <LyricsNotAvailableState />
      ) : (
        <LyricsBlock lyrics={currentSong.lyrics} />
      )}
    </div>
  );
};

export default LyricsDisplay;
