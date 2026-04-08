"use client";

import { useState, useEffect } from 'react';
import { Drawer, Input, List, Avatar, Empty, App, Spin } from 'antd';
import {SearchOutlined, PlusOutlined, WarningOutlined} from '@ant-design/icons';
import { ApiService } from '@/api/apiService';
import { SongSearchResult } from '@/types/song';

const { Search } = Input;
const apiService = new ApiService();

interface SongSearchDrawerProps {
    open: boolean;
    onClose: () => void;
    onAddSong: (song: SongSearchResult) => void;
    sessionId: string;
}

export default function SongSearchDrawer({ open, onClose, onAddSong, sessionId }: SongSearchDrawerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SongSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { notification } = App.useApp();

    useEffect(() => {
        const query = searchQuery.trim();

        if (!query) {
            setSearchResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams({ query });
                const data = await apiService.get<SongSearchResult[]>(`/songs/search?${params}`);
                setSearchResults(data);
            } catch {
                notification.error({
                    title: 'Search failed',
                    description: 'Could not reach the server.',
                });
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchQuery, notification]);

    const handleAddSong = async (song: SongSearchResult) => {
        try {
            await apiService.post(`/sessions/${sessionId}/playlist`, {
                spotifyId: song.spotifyId,
                geniusId: song.geniusId,
                title: song.title,
                artist: song.artist,
            });

            onAddSong(song);
            notification.success({
                title: 'Song Added',
                description: `"${song.title}" by ${song.artist} has been added to the queue.`,
                placement: 'topRight',
            });
            setSearchQuery('');
            setSearchResults([]);
        } catch {
            notification.error({
                title: 'Failed to add song',
                description: 'Could not add the song to the queue.',
            });
        }
    };


    const handleClose = () => {
        setSearchQuery('');
        setSearchResults([]);
        onClose();
    };

    const showEmpty = !isLoading && searchQuery && searchResults.length === 0;
    const showResults = !isLoading && searchResults.length > 0;

    return (
        <Drawer
            title="Search Songs"
            placement="right"
            onClose={handleClose}
            open={open}
            size={400}
        >
            <div style={{ marginBottom: 24 }}>
                <Search
                    placeholder="Search by title or artist"
                    size="large"
                    prefix={<SearchOutlined />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    loading={isLoading}
                    allowClear
                />
            </div>

            {isLoading && (
                <div style={{ textAlign: 'center', marginTop: 48 }}>
                    <Spin size="large" />
                </div>
            )}

            {showEmpty && (
                <Empty description="No songs found" style={{ marginTop: 48 }} />
            )}

            {showResults && (
                <List
                    dataSource={searchResults}
                    renderItem={(item) => (
                        <List.Item
                            style={{
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '16px 0',
                            }}
                            actions={[
                                <PlusOutlined
                                    key="add"
                                    onClick={() => handleAddSong(item)}
                                    style={{ fontSize: 18, color: '#FF2D7E', cursor: 'pointer' }}
                                />,
                            ]}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        size={48}
                                        style={{
                                            background: 'linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)',
                                            fontSize: 24,
                                        }}
                                    >
                                    </Avatar>
                                }
                                title={<span style={{ color: '#FFFFFF', fontWeight: 500 }}>{item.title}</span>}
                                description={
                                    <div>
                                        <div style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{item.artist}</div>
                                        {!item.lyricsAvailable && (
                                            <div style={{ color: '#faad14', fontSize: 12 }}>
                                                <WarningOutlined /> No lyrics available
                                            </div>
                                        )}
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}

            {!searchQuery && (
                <Empty description="Search for songs to add to your queue" style={{ marginTop: 48 }} />
            )}
        </Drawer>
    );
}