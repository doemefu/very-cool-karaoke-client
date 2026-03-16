"use client";

import { useState, useEffect } from 'react';
import { Layout, Button, Badge, Typography, List, Space, Popconfirm, message, ConfigProvider, theme} from 'antd';
import {
    PauseCircleOutlined,
    PlayCircleOutlined,
    PoweroffOutlined,
    DeleteOutlined,
    PlusOutlined,
    FastForwardOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from "next/navigation";
import SongSearchDrawer from '../../components/SongSearchDrawer';
import VotingPhase from '../../components/VotingPhase';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const mockLyrics = [
    "We've been searching for a place to call our own",
    "Walking through the night, we're never alone",
    "Hearts are racing, music in the air",
    "This is our moment, without a single care",
    "Sing it loud, sing it clear",
    "Let the whole world hear",
    "This is our night, this is our song",
    "We'll be singing all night long",
    "Dancing in the moonlight, feeling so alive",
    "Together we will thrive",
    "Every note we hit, every word we say",
    "Makes this perfect day",
];

const initialQueue = [
    { id: '2', title: 'Wonderwall', artist: 'Oasis', addedBy: 'User1' },
    { id: '3', title: "Livin' on a Prayer", artist: 'Bon Jovi', addedBy: 'User2' },
    { id: '4', title: "Sweet Child O' Mine", artist: "Guns N' Roses", addedBy: 'Admin' },
    { id: '5', title: "Don't Stop Believin'", artist: 'Journey', addedBy: 'User3' },
];

interface QueueItemProps {
    song: any;
    onRemove: (songId: string) => void;
}

function QueueItem({ song, onRemove }: QueueItemProps) {
    return (
        <div style={{ marginBottom: 8 }}>
            <List.Item
                style={{
                    background: '#0D0D1A',
                    padding: '12px',
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                actions={[
                    <DeleteOutlined
                        key="delete"
                        onClick={() => onRemove(song.id)}
                        style={{ color: '#FF2D7E', cursor: 'pointer' }}
                    />,
                ]}
            >
                <List.Item.Meta
                    title={<span style={{ color: '#FFFFFF' }}>{song.title}</span>}
                    description={
                        <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                  {song.artist} • Added by {song.addedBy}
                </span>
                    }
                />
            </List.Item>
        </div>
    );
}

export default function ActiveSession() {
    const navigate = useRouter();
    const params = useParams();
    const id = params?.['session-id'];

    const [isPaused, setIsPaused] = useState(false);
    const [participantCount] = useState(12);
    const [currentLine, setCurrentLine] = useState(0);
    const [queue, setQueue] = useState(initialQueue);
    const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
    const [showVoting, setShowVoting] = useState(true);         // 1. start with voting
    const [isInitialVoting, setIsInitialVoting] = useState(true); // 2. first time = initial mode
    const [reactions, setReactions] = useState<Array<{ id: string; emoji: string; x: number }>>([]);
    const [currentSong] = useState({ title: 'Bohemian Rhapsody', artist: 'Queen' });

    // Auto-scroll lyrics
    useEffect(() => {
        if (!isPaused) {
            const interval = setInterval(() => {
                setCurrentLine((prev) => (prev + 1) % mockLyrics.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [isPaused]);

    // Floating reactions
    useEffect(() => {
        const interval = setInterval(() => {
            const emojis = ['👏', '🔥', '❤️', '😂', '🎉'];
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            const x = Math.random() * 90 + 5;
            const reactionId = Math.random().toString(36);
            setReactions((prev) => [...prev, { id: reactionId, emoji, x }]);
            setTimeout(() => {
                setReactions((prev) => prev.filter((r) => r.id !== reactionId));
            }, 3000);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleRemoveSong = (songId: string) => {
        setQueue((prev) => prev.filter((song) => song.id !== songId));
        message.success('Song removed from queue');
    };

    const handleAddSong = (song: any) => {
        setQueue((prev) => [...prev, { ...song, addedBy: 'Admin' }]);
        setSearchDrawerOpen(false);
    };

    const handleSkip = () => {
        if (queue.length > 0) {
            message.success('Skipping to next song...');
            setIsInitialVoting(false); // 3. all subsequent votes use normal timer mode
            setShowVoting(true);
        } else {
            message.warning('No songs in queue');
        }
    };

    const handleEndSession = () => {
        navigate.push(`/session/${id}/review`);
    };

    const handleVotingComplete = (winnerId: string) => {
        setShowVoting(false);
        message.success('Next song selected!');
    };

    if (showVoting) {
        return <VotingPhase onVotingComplete={handleVotingComplete} isInitial={isInitialVoting} />;
    }

    return (
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
            <Layout style={{ minHeight: '100vh', background: '#0D0D1A' }}>
                {/* Top Bar */}
                <Header
                    style={{
                        background: '#0D0D1A',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 24px',
                        position: 'sticky',
                        top: 0,
                        zIndex: 100,
                    }}
                >
                    <Space size={16}>
                        <Title level={4} style={{ margin: 0, color: '#FF2D7E' }}>
                            Friday Night Vibes
                        </Title>
                        <Badge
                            count={participantCount}
                            style={{ backgroundColor: '#00C2FF' }}
                            overflowCount={99}
                        />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>participants</Text>
                    </Space>

                    <Space size={12}>
                        <Button
                            icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                            onClick={() => setIsPaused(!isPaused)}
                        >
                            {isPaused ? 'Resume' : 'Pause'}
                        </Button>
                        <Popconfirm
                            title="End Session"
                            description="Are you sure you want to end this session?"
                            onConfirm={handleEndSession}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button danger icon={<PoweroffOutlined />}>
                                End Session
                            </Button>
                        </Popconfirm>
                    </Space>
                </Header>

                <Layout>
                    {/* Main Content - Lyrics */}
                    <Content style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                            {/* Current Song Info */}
                            <div style={{ marginBottom: 48 }}>
                                <Title level={2} style={{ color: '#FFFFFF', marginBottom: 8 }}>
                                    {currentSong.title}
                                </Title>
                                <Text style={{ color: '#00C2FF', fontSize: 18 }}>{currentSong.artist}</Text>
                            </div>

                            {/* Scrolling Lyrics */}
                            <div
                                style={{
                                    minHeight: 400,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    gap: 16,
                                }}
                            >
                                {mockLyrics.map((line, index) => {
                                    const isActive = index === currentLine;
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                fontSize: 20,
                                                color: '#FFFFFF',
                                                fontWeight: 400,
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            {line}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Floating Reactions */}
                        {reactions.map((reaction) => (
                            <div
                                key={reaction.id}
                                style={{
                                    position: 'absolute',
                                    bottom: 20,
                                    left: `${reaction.x}%`,
                                    fontSize: 48,
                                    pointerEvents: 'none',
                                    animation: 'floatUp 3s ease-out forwards',
                                }}
                            >
                                {reaction.emoji}
                            </div>
                        ))}

                        <style>{`
            @keyframes floatUp {
              0%   { opacity: 1; transform: translateY(0) scale(1); }
              100% { opacity: 0; transform: translateY(-300px) scale(1.5); }
            }
          `}</style>
                    </Content>

                    {/* Right Sidebar - Queue */}
                    <Sider
                        width={350}
                        style={{
                            background: '#1A1A2E',
                            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: 24,
                            overflow: 'auto',
                        }}
                    >
                        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Title level={4} style={{ margin: 0, color: '#FFFFFF' }}>
                                Queue ({queue.length})
                            </Title>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setSearchDrawerOpen(true)}
                            >
                                Add Song
                            </Button>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <Button
                                block
                                size="large"
                                icon={<FastForwardOutlined />}
                                onClick={handleSkip}
                                style={{
                                    background: 'linear-gradient(135deg, #00C2FF 0%, #0091C7 100%)',
                                    border: 'none',
                                    color: '#FFFFFF',
                                    fontWeight: 600,
                                }}
                            >
                                Skip to Voting
                            </Button>
                        </div>

                        <List
                            dataSource={queue}
                            renderItem={(song, index) => (
                                <QueueItem
                                    key={song.id}
                                    song={song}
                                    onRemove={handleRemoveSong}
                                />
                            )}
                            locale={{ emptyText: 'No songs in queue. Add some!' }}
                        />
                    </Sider>
                </Layout>

                {/* Song Search Drawer */}
                <SongSearchDrawer
                    open={searchDrawerOpen}
                    onClose={() => setSearchDrawerOpen(false)}
                    onAddSong={handleAddSong}
                />
            </Layout>
        </ConfigProvider>
    );
}