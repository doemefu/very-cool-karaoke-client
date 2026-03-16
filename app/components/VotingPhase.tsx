"use client";

import { useState, useEffect } from 'react';
import { Card, Button, Progress, Typography, List, Badge, Space, Drawer } from 'antd';
import { TrophyOutlined, PlusOutlined, FastForwardOutlined } from '@ant-design/icons';
import SongSearchModal from './SongSearchModal';

const { Title, Text } = Typography;

interface Song {
    id: string;
    title: string;
    artist: string;
    votes: number;
}

const initialSongs: Song[] = [
    { id: '1', title: 'Hotel California', artist: 'Eagles', votes: 0 },
    { id: '2', title: 'Rocket Man', artist: 'Elton John', votes: 0 },
    { id: '3', title: 'Eye of the Tiger', artist: 'Survivor', votes: 0 },
    { id: '4', title: 'Total Eclipse of the Heart', artist: 'Bonnie Tyler', votes: 0 },
    { id: '5', title: 'Africa', artist: 'Toto', votes: 0 },
];

interface VotingPhaseProps {
    onVotingComplete: (winnerId: string) => void;
    /** When true: no timer, show Add Song button, admin ends voting manually */
    isInitial?: boolean;
}

const COUNTDOWN_SECONDS = 30;

export default function VotingPhase({ onVotingComplete, isInitial = false }: VotingPhaseProps) {
    const [votedSongId, setVotedSongId] = useState<string | null>(null);
    const [songs, setSongs] = useState<Song[]>(initialSongs);
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const [showWinner, setShowWinner] = useState(false);
    const [addSongDrawerOpen, setAddSongDrawerOpen] = useState(false);

    // Timer — only runs in normal (non-initial) mode
    useEffect(() => {
        if (isInitial) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setShowWinner(true);
                    setTimeout(() => {
                        const winner = [...songs].sort((a, b) => b.votes - a.votes)[0];
                        onVotingComplete(winner.id);
                    }, 3000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isInitial, songs, onVotingComplete]);

    const handleVote = (songId: string) => {
        if (votedSongId) {
            setSongs((prev) =>
                prev.map((song) =>
                    song.id === votedSongId ? { ...song, votes: song.votes - 1 } : song
                )
            );
        }
        setSongs((prev) =>
            prev.map((song) => (song.id === songId ? { ...song, votes: song.votes + 1 } : song))
        );
        setVotedSongId(songId);
    };

    interface SongInput {
        id?: string;
        title: string;
        artist: string;
    }

    const handleAddSong = (song: SongInput) => {
        const newSong: Song = {
            id: Math.random().toString(36).substring(2, 11),
            title: song.title,
            artist: song.artist,
            votes: 0,
        };
        setSongs((prev) => [...prev, newSong]);
        setAddSongDrawerOpen(false);
    };

    // Admin manually ends the initial voting
    const handleStartSession = () => {
        const winner = [...songs].sort((a, b) => b.votes - a.votes)[0];
        setShowWinner(true);
        setTimeout(() => {
            onVotingComplete(winner.id);
        }, 3000);
    };

    const sortedSongs = [...songs].sort((a, b) => b.votes - a.votes);
    const maxVotes = Math.max(...songs.map((s) => s.votes), 1);
    const winner = sortedSongs[0];

    // ── WINNER SCREEN ─────────────────────────────────────────────────────────
    if (showWinner) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(13, 13, 26, 0.98)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, animation: 'fadeIn 0.4s ease',
            }}>
                <TrophyOutlined style={{ fontSize: 120, color: '#FFD700', marginBottom: 24, animation: 'bounce 0.5s ease 3' }} />
                <Title level={1} style={{ color: '#FFFFFF', marginBottom: 16 }}>🎉 Winner! 🎉</Title>
                <Title level={2} style={{ color: '#FF2D7E', marginBottom: 8 }}>{winner.title}</Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: 20 }}>by {winner.artist}</Text>
                <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Badge count={winner.votes} style={{ backgroundColor: '#FF2D7E', fontSize: 24, height: 48, lineHeight: '48px', minWidth: 48 }} />
                    <Text style={{ color: '#FFFFFF', fontSize: 18 }}>votes</Text>
                </div>
                <style>{`
                    @keyframes fadeIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
                    @keyframes bounce { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(10deg); } 75% { transform: rotate(-10deg); } }
                `}</style>
            </div>
        );
    }

    // ── VOTING SCREEN ─────────────────────────────────────────────────────────
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(13, 13, 26, 0.98)',
            overflow: 'auto', padding: 24, zIndex: 1000,
        }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <Title level={1} style={{ color: '#FFFFFF', margin: 0 }}>
                            Vote for the next song! ⚡
                        </Title>
                        {/* Timer — only shown in normal mode */}
                        {!isInitial && (
                            <Progress
                                type="circle"
                                percent={(countdown / COUNTDOWN_SECONDS) * 100}
                                format={() => countdown}
                                strokeColor="#FF2D7E"
                                railColor="rgba(255, 255, 255, 0.1)"
                                size={80}
                            />
                        )}
                    </div>
                    <Space size={12}>
                        {/* Add Song — only in initial mode */}
                        {isInitial && (
                            <Button
                                size="large"
                                icon={<PlusOutlined />}
                                onClick={() => setAddSongDrawerOpen(true)}
                            >
                                Add Song
                            </Button>
                        )}
                        {/* Start Session — only in initial mode */}
                        {isInitial && (
                            <Button
                                type="primary"
                                size="large"
                                icon={<FastForwardOutlined />}
                                onClick={handleStartSession}
                                style={{ fontWeight: 600 }}
                            >
                                Start Session
                            </Button>
                        )}
                    </Space>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
                    {/* Voting Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, alignContent: 'start' }}>
                        {songs.map((song) => {
                            const votePercentage = (song.votes / maxVotes) * 100;
                            const isVoted = votedSongId === song.id;
                            return (
                                <div
                                    key={song.id}
                                    style={{ transition: 'transform 0.15s ease' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
                                    onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                                >
                                    <Card style={{
                                        background: isVoted ? 'linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)' : '#1A1A2E',
                                        border: isVoted ? '2px solid #FF2D7E' : '1px solid rgba(255, 255, 255, 0.1)',
                                        height: '100%',
                                    }}>
                                        <div style={{ marginBottom: 16 }}>
                                            <Text strong style={{ color: '#FFFFFF', fontSize: 16, display: 'block', marginBottom: 4 }}>{song.title}</Text>
                                            <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{song.artist}</Text>
                                        </div>
                                        <Progress percent={votePercentage} showInfo={false} strokeColor="#00C2FF" railColor="rgba(255, 255, 255, 0.1)" style={{ marginBottom: 12 }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ color: '#FFFFFF' }}>{song.votes} votes</Text>
                                            <Button type={isVoted ? 'default' : 'primary'} onClick={() => handleVote(song.id)} disabled={isVoted}>
                                                {isVoted ? 'Voted ✓' : 'Vote'}
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>

                    {/* Live Leaderboard */}
                    <Card
                        title={<span style={{ color: '#FFFFFF', fontSize: 18 }}><TrophyOutlined style={{ marginRight: 8, color: '#FFD700' }} />Live Leaderboard</span>}
                        style={{ height: 'fit-content', position: 'sticky', top: 24 }}
                    >
                        <List
                            dataSource={sortedSongs}
                            renderItem={(song, index) => (
                                <List.Item style={{ borderBottom: index < sortedSongs.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none', padding: '12px 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#1A1A2E',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', color: index < 3 ? '#000000' : '#FFFFFF',
                                        }}>
                                            {index + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <Text strong style={{ color: '#FFFFFF', display: 'block', fontSize: 14 }}>{song.title}</Text>
                                            <Text style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 12 }}>{song.artist}</Text>
                                        </div>
                                        <Badge count={song.votes} style={{ backgroundColor: index === 0 ? '#FF2D7E' : 'rgba(255, 255, 255, 0.2)' }} />
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </div>
            </div>

            {/* Add Song Drawer — only in initial mode */}
            {isInitial && (
                <Drawer
                    title={<span style={{ color: '#FFFFFF' }}>Add a Song</span>}
                    placement="bottom"
                    open={addSongDrawerOpen}
                    onClose={() => setAddSongDrawerOpen(false)}
                    styles={{
                        header: { background: '#1A1A2E', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' },
                        body: { background: '#1A1A2E', padding: 24 },
                        wrapper: { height: '80dvh' },
                    }}
                    style={{ width: '50%', margin: '0 auto', borderRadius: '16px 16px 0 0' }}
                >
                    <SongSearchModal onSelectSong={handleAddSong} />
                </Drawer>
            )}
        </div>
    );
}