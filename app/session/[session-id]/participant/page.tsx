"use client";

import { useState, useEffect } from 'react';
import { Layout, Badge, Typography, Button, Space, ConfigProvider, theme, List } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import SongSearchDrawer from '../../../components/SongSearchDrawer';

const { Header, Content } = Layout;
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

const reactionEmojis = [
    { emoji: '👏', label: 'Clap' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '😂', label: 'Joy' },
    { emoji: '🎉', label: 'Party' },
];

const initialQueue = [
    { id: '2', title: 'Wonderwall', artist: 'Oasis', addedBy: 'User1' },
    { id: '3', title: "Livin' on a Prayer", artist: 'Bon Jovi', addedBy: 'User2' },
    { id: '4', title: "Sweet Child O' Mine", artist: "Guns N' Roses", addedBy: 'Admin' },
    { id: '5', title: "Don't Stop Believin'", artist: 'Journey', addedBy: 'User3' },
];

export default function ParticipantSession() {
    const navigate = useRouter();
    const [participantCount] = useState(12);
    const [reactions, setReactions] = useState<Array<{ id: string; emoji: string; x: number }>>([]);
    const [currentSong] = useState({ title: 'Bohemian Rhapsody', artist: 'Queen' });
    const [queue, setQueue] = useState(initialQueue);
    const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);

    // Random reactions from others
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

    const handleReaction = (emoji: string) => {
        const x = 45 + Math.random() * 10;
        const reactionId = Math.random().toString(36);
        setReactions((prev) => [...prev, { id: reactionId, emoji, x }]);
        setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== reactionId));
        }, 3000);
    };

    const handleAddSong = (song: any) => {
        setQueue((prev) => [...prev, { ...song, addedBy: 'You' }]);
        setSearchDrawerOpen(false);
    };

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
                        <Badge count={participantCount} style={{ backgroundColor: '#00C2FF' }} overflowCount={99} />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>participants</Text>
                    </Space>
                    <Space size={12}>
                        <Badge status="success" text="Live" />
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate.push('/dashboard')}>
                            Leave Session
                        </Button>
                    </Space>
                </Header>

                <Layout>
                    {/* Main Content - Lyrics */}
                    <Content
                        style={{
                            padding: 24,
                            paddingBottom: 120,
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                maxWidth: 900,
                                margin: '0 auto',
                                textAlign: 'center',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {/* Current Song Info */}
                            <div style={{ marginBottom: 48 }}>
                                <Title level={2} style={{ color: '#FFFFFF', marginBottom: 8 }}>
                                    {currentSong.title}
                                </Title>
                                <Text style={{ color: '#00C2FF', fontSize: 18 }}>{currentSong.artist}</Text>
                            </div>

                            {/* Lyrics */}
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    gap: 16,
                                    minHeight: 500,
                                }}
                            >
                                {mockLyrics.map((line, index) => (
                                    <div
                                        key={index}
                                        style={{ fontSize: 24, color: '#FFFFFF', fontWeight: 400, lineHeight: 1.6 }}
                                    >
                                        {line}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Floating Reactions */}
                        {reactions.map((reaction) => (
                            <div
                                key={reaction.id}
                                style={{
                                    position: 'absolute',
                                    bottom: 80,
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

                        {/* Bottom Reaction Bar */}
                        <div
                            style={{
                                position: 'fixed',
                                bottom: 0,
                                left: 0,
                                right: 350,
                                background: 'rgba(26, 26, 46, 0.95)',
                                backdropFilter: 'blur(10px)',
                                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '16px 24px',
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 16,
                                zIndex: 100,
                            }}
                        >
                            {reactionEmojis.map((item) => (
                                <Button
                                    key={item.emoji}
                                    type="text"
                                    size="large"
                                    onClick={() => handleReaction(item.emoji)}
                                    style={{
                                        fontSize: 40,
                                        height: 72,
                                        width: 72,
                                        padding: 0,
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: 16,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'transform 0.1s ease',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
                                    onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                                >
                                    {item.emoji}
                                </Button>
                            ))}
                        </div>
                    </Content>

                    {/* Right Sidebar - Queue (read-only) */}
                    <Layout.Sider
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

                        <List
                            dataSource={queue}
                            renderItem={(song, index) => (
                                <div key={song.id} style={{ marginBottom: 8 }}>
                                    <List.Item
                                        style={{
                                            background: '#0D0D1A',
                                            padding: '12px',
                                            borderRadius: 8,
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                        }}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <div
                                                    style={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: '50%',
                                                        background: index === 0
                                                            ? 'linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)'
                                                            : 'rgba(255,255,255,0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#FFFFFF',
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {index + 1}
                                                </div>
                                            }
                                            title={<span style={{ color: '#FFFFFF' }}>{song.title}</span>}
                                            description={
                                                <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                          {song.artist} • Added by {song.addedBy}
                        </span>
                                            }
                                        />
                                    </List.Item>
                                </div>
                            )}
                            locale={{ emptyText: 'No songs in queue yet.' }}
                        />
                    </Layout.Sider>
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