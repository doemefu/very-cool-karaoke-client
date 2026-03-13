"use client";

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { Layout, Card, Input, Button, Steps, Typography, Space, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
// import { useNavigate } from 'react-router';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CreateSession() {
  const navigate = useRouter();
  const [sessionName, setSessionName] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');

  const generatePin = () => {
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    setPin(newPin);
  };

  const handleStartSession = () => {
    if (!sessionName.trim()) {
      message.error('Please enter a session name');
      return;
    }
    if (!pin) {
      message.error('Please generate a PIN');
      return;
    }

    // Mock session creation
    const sessionId = Math.random().toString(36).substr(2, 9);
    message.success('Session created successfully!');
    navigate.push(`/session/${sessionId}`);
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
          Create New Session
        </Title>
      </Header>

      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Steps */}
          <Card style={{ marginBottom: 32 }}>
            <Steps
              current={0}
              items={[
                { title: 'Setup' },
                { title: 'Invite' },
                { title: 'Party' },
              ]}
            />
          </Card>

          {/* Main Form Card */}
          <Card>
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              <div>
                <Text strong style={{ color: '#FFFFFF', fontSize: 16 }}>
                  Session Name
                </Text>
                <Input
                  size="large"
                  placeholder="Enter session name"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              </div>

              <div>
                <Text strong style={{ color: '#FFFFFF', fontSize: 16 }}>
                  Description
                </Text>
                <TextArea
                  size="large"
                  placeholder="Add a description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  style={{ marginTop: 8 }}
                />
              </div>

              {/* PIN Display */}
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Text strong style={{ color: '#FFFFFF', fontSize: 16, display: 'block', marginBottom: 16 }}>
                  Session PIN
                </Text>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)',
                    padding: '32px',
                    borderRadius: 16,
                    marginBottom: 16,
                  }}
                >
                  {pin ? (
                    <Title
                      level={1}
                      style={{
                        margin: 0,
                        color: '#FFFFFF',
                        fontSize: 64,
                        letterSpacing: 16,
                        fontWeight: 700,
                      }}
                    >
                      {pin}
                    </Title>
                  ) : (
                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 24 }}>
                      Click below to generate
                    </Text>
                  )}
                </div>
                <Button size="large" onClick={generatePin}>
                  {pin ? 'Regenerate PIN' : 'Generate PIN'}
                </Button>
              </div>

              {/* Start Session Button */}
              <Button
                type="primary"
                size="large"
                block
                onClick={handleStartSession}
                style={{
                  marginTop: 24,
                  height: 56,
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                Start Session
              </Button>
            </Space>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
