"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Typography, Layout, Button, Steps, Input, message, Modal } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useApi } from '@/hooks/useApi';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// Mock component since it isn't imported
const SongSearchModal = ({ onSelectSong }: { onSelectSong: (song: any) => void }) => {
  return (
    <Button block size="large" onClick={() => onSelectSong({ title: 'Bohemian Rhapsody', artist: 'Queen' })}>
      Select Bohemian Rhapsody
    </Button>
  );
};

export default function JoinSession() {
  const router = useRouter();
  const apiService = useApi();
  const [pin, setPin] = useState('');

  const handleJoinWithPin = async () => {
    if (pin.length !== 6) {
      message.error('Please enter a valid 6-digit PIN');
      return;
    }

    try {
      // 1. Get the session by pin to get its ID
      const session = await apiService.get<any>(`/sessions/pin/${pin}`);

      // 2. Join the session
      await apiService.post(`/sessions/${session.id}/participants`, { gamePin: pin });

      // 3. On success: redirect user to the session page
      message.success(`Joined successfully!`);
      router.push(`/sessions/${session.id}`);
    } catch (error: any) {
      // 4. On failure (404): display the specific message
      if (error.status === 404) {
        message.error('Invalid game pin, please check and try again');
      } else {
        message.error('Invalid game pin, please check and try again');
      }
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#0D0D1A' }}>
      <Header
        style={{
          background: '#0D0D1A',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/dashboard')}
          style={{ marginRight: 16, color: '#FFFFFF' }}
        >
          Back to Dashboard
        </Button>
        <Title level={3} style={{ margin: 0, color: '#FF2D7E' }}>
          Join a Session
        </Title>
      </Header>

      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <Title level={2} style={{ color: '#FFFFFF', marginBottom: 8 }}>
                Enter Session PIN
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.65)', display: 'block', marginBottom: 48 }}>
                Get the PIN from your session host
              </Text>

              <Input
                size="large"
                placeholder="000000"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                style={{
                  fontSize: 32,
                  textAlign: 'center',
                  letterSpacing: 8,
                  fontWeight: 700,
                  marginBottom: 32,
                }}
              />

              <Button
                type="primary"
                size="large"
                block
                onClick={handleJoinWithPin}
                style={{ height: 56, fontSize: 18, fontWeight: 600 }}
              >
                Join Session
              </Button>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}