"use client";

import { Layout, Card, Button, Typography, List, Badge, Space, ConfigProvider, theme } from 'antd';
import { TrophyOutlined, ShareAltOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from "next/navigation";

const { Content } = Layout;
const { Title, Text } = Typography;

const performedSongs = [
  { id: '1', title: 'Bohemian Rhapsody', artist: 'Queen', performer: 'Admin', votes: 15, isFavorite: false },
  { id: '2', title: 'Wonderwall', artist: 'Oasis', performer: 'User1', votes: 23, isFavorite: true },
  { id: '3', title: "Livin' on a Prayer", artist: 'Bon Jovi', performer: 'User2', votes: 18, isFavorite: false },
  { id: '4', title: "Sweet Child O' Mine", artist: "Guns N' Roses", performer: 'Admin', votes: 12, isFavorite: false },
  { id: '5', title: "Don't Stop Believin'", artist: 'Journey', performer: 'User3', votes: 20, isFavorite: false },
];

export default function SessionReview() {
  const navigate = useRouter();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleBackToDashboard = () => {
    navigate.push('/dashboard');
  };

  return (
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <Layout style={{ minHeight: '100vh', background: '#0D0D1A' }}>
          <Content style={{ padding: '48px 24px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>

              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <Title level={1} style={{ color: '#FFFFFF', marginBottom: 16 }}>
                  What a night! 🎤✨
                </Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: 18 }}>
                  Friday Night Vibes • {performedSongs.length} songs performed
                </Text>
              </div>

              {/* Song Timeline */}
              <Card style={{ marginBottom: 32 }}>
                <Title level={4} style={{ color: '#FFFFFF', marginBottom: 24 }}>
                  Performance Timeline
                </Title>
                <List
                    dataSource={performedSongs}
                    renderItem={(song, index) => (
                        <List.Item
                            style={{
                              borderBottom:
                                  index < performedSongs.length - 1
                                      ? '1px solid rgba(255, 255, 255, 0.1)'
                                      : 'none',
                              padding: '20px 0',
                            }}
                        >
                          <div style={{ width: '100%' }}>
                            <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div
                                    style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: '50%',
                                      background: 'linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 'bold',
                                      color: '#FFFFFF',
                                    }}
                                >
                                  {index + 1}
                                </div>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Text strong style={{ color: '#FFFFFF', fontSize: 16 }}>
                                      {song.title}
                                    </Text>
                                    {song.isFavorite && (
                                        <Badge
                                            count="Crowd Favourite"
                                            style={{
                                              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                              color: '#000000',
                                              fontWeight: 600,
                                            }}
                                        />
                                    )}
                                  </div>
                                  <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                                    {song.artist} • Performed by {song.performer}
                                  </Text>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <TrophyOutlined style={{ color: '#FFD700' }} />
                                  <Text style={{ color: '#FFFFFF', fontWeight: 600 }}>
                                    {song.votes} votes
                                  </Text>
                                </div>
                              </div>
                            </Space>
                          </div>
                        </List.Item>
                    )}
                />
              </Card>

              {/* Stats Card */}
              <Card
                  style={{
                    marginBottom: 32,
                    background: 'linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)',
                    border: 'none',
                  }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: '#FFFFFF', marginBottom: 16 }}>
                    Session Highlights
                  </Title>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                    <div>
                      <Title level={2} style={{ color: '#FFFFFF', margin: 0 }}>
                        {performedSongs.length}
                      </Title>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Songs Performed</Text>
                    </div>
                    <div>
                      <Title level={2} style={{ color: '#FFFFFF', margin: 0 }}>
                        {performedSongs.reduce((sum, song) => sum + song.votes, 0)}
                      </Title>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Total Votes</Text>
                    </div>
                    <div>
                      <Title level={2} style={{ color: '#FFFFFF', margin: 0 }}>
                        12
                      </Title>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Participants</Text>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <Space size={16} style={{ width: '100%', justifyContent: 'center' }}>
                <Button
                    size="large"
                    icon={<ShareAltOutlined />}
                    onClick={handleShare}
                    style={{
                      background: '#00C2FF',
                      border: 'none',
                      color: '#FFFFFF',
                      fontWeight: 600,
                    }}
                >
                  Share Results
                </Button>
                <Button
                    type="primary"
                    size="large"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBackToDashboard}
                >
                  Back to Dashboard
                </Button>
              </Space>

            </div>
          </Content>
        </Layout>
      </ConfigProvider>
  );
}