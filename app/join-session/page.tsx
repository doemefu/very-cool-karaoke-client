"use client";


import { useState } from 'react';
import {Layout, Card, Input, Button, Steps, Typography, Modal, message, Drawer} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from "next/navigation";
import SongSearchModal from '../components/SongSearchModal';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function JoinSession() {
  const navigate = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [pin, setPin] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [showSongModal, setShowSongModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<any>(null);

  const handleJoinWithPin = () => {
    if (pin.length !== 6) {
      message.error('Please enter a valid 6-digit PIN');
      return;
    }

    // Mock PIN validation
    const validPins = ['123456', '789012'];
    if (!validPins.includes(pin)) {
      message.error('Invalid PIN. Try 123456 or 789012');
      return;
    }

    // Mock session name based on PIN
    setSessionName(pin === '123456' ? 'Friday Night Vibes' : 'Office Party 2026');
    setCurrentStep(1);
    setShowSongModal(true);
  };

  const handleAddSong = (song: any) => {
    setSelectedSong(song);
    setShowSongModal(false);
  };

  const handleJoinSession = () => {
    if (!selectedSong) {
      message.error('Please select a song before joining');
      return;
    }

    // Mock joining - navigate to participant view
    const sessionId = Math.random().toString(36).substr(2, 9);
    message.success(`Joined ${sessionName}!`);
    navigate.push(`/session/${sessionId}/participant`);
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
          onClick={() => navigate.push('/dashboard')}
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
          {/* Steps Indicator */}
          <Card style={{ marginBottom: 32 }}>
            <Steps
              current={currentStep}
              items={[{ title: 'Enter PIN' }, { title: 'Choose Song' }]}
            />
          </Card>

          {/* Step 1: PIN Entry */}
          {currentStep === 0 && (
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

                <div style={{ marginTop: 32 }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 14 }}>
                    Demo PINs: 123456 or 789012
                  </Text>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Song Selection Confirmation */}
          {currentStep === 1 && (
            <Card>
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <Title level={2} style={{ color: '#FFFFFF', marginBottom: 8 }}>
                  You're joining: {sessionName}
                </Title>
                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.65)',
                    display: 'block',
                    marginBottom: 48,
                  }}
                >
                  {selectedSong
                    ? 'Ready to join with your song selection!'
                    : 'Add one song to get started'}
                </Text>

                {selectedSong ? (
                  <Card
                    style={{
                      background: 'linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)',
                      border: 'none',
                      marginBottom: 32,
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
                      <Title level={4} style={{ color: '#FFFFFF', marginBottom: 8 }}>
                        {selectedSong.title}
                      </Title>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        by {selectedSong.artist}
                      </Text>
                    </div>
                  </Card>
                ) : (
                  <div
                    style={{
                      padding: 48,
                      border: '2px dashed rgba(255, 255, 255, 0.2)',
                      borderRadius: 8,
                      marginBottom: 32,
                    }}
                  >
                    <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}>🎤</div>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                      No song selected yet
                    </Text>
                  </div>
                )}

                <Button
                  size="large"
                  block
                  onClick={() => setShowSongModal(true)}
                  style={{ marginBottom: 16 }}
                >
                  {selectedSong ? 'Change Song' : 'Select a Song'}
                </Button>

                {selectedSong && (
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleJoinSession}
                    style={{ height: 56, fontSize: 18, fontWeight: 600 }}
                  >
                    Join the Party! 🎉
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </Content>

      {/* Song Search Modal */}
        <Drawer
            title={<span style={{ color: '#FFFFFF' }}>Choose Your First Song</span>}
            placement="bottom"
            height="80%"
            open={showSongModal}
            onClose={() => {
                if (selectedSong) {
                    setShowSongModal(false);
                } else {
                    message.warning('Please select a song to continue');
                }
            }}
            styles={{
                header: { background: '#1A1A2E', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' },
                body: { background: '#1A1A2E', padding: 24 },
            }}
            style={{
                width: '50%',
                margin: '0 auto',        // zentriert
                borderRadius: '16px 16px 0 0',  // abgerundete obere Ecken
            }}
        >
            <SongSearchModal onSelectSong={handleAddSong} />
        </Drawer>
    </Layout>
  );
}