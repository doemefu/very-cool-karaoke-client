"use client";

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { Layout, Card, Button, Avatar, Dropdown, Tabs, Badge, Space, Typography, ConfigProvider, theme } from 'antd';
import { UserOutlined, LogoutOutlined, PlusOutlined, LockOutlined } from '@ant-design/icons';
// import { useNavigate } from 'react-router';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// Mock data for sessions
const mockSessions = {
  created: [
    {
      id: '1',
      name: 'Friday Night Vibes',
      description: 'End of week celebration karaoke',
      date: '2026-03-10',
      active: true,
    },
    {
      id: '2',
      name: 'Birthday Bash',
      description: "Sarah's 30th birthday party",
      date: '2026-03-05',
      active: false,
    },
  ],
  joined: [
    {
      id: '3',
      name: 'Office Party 2026',
      description: 'Annual company karaoke night',
      date: '2026-03-08',
      active: false,
    },
  ],
};

export default function Dashboard() {
  const navigate = useRouter();
  const [username] = useState('KaraokeAdmin');

  const userMenuItems = [
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: 'Change Password',
      onClick: () => navigate.push('/edit'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => navigate.push('/'),
    },
  ];

  const handleCreateParty = () => {
    navigate.push('/create-session');
  };

  const handleJoinParty = () => {
    navigate.push('/join-session');
  };

  const handleRejoin = (sessionId: string) => {
    navigate.push(`/session/${sessionId}`);
  };

  const renderSessionCard = (session: any, isCreated: boolean) => (
    <Card
      key={session.id}
      style={{ marginBottom: 16 }}
      styles={{
        body: { padding: '16px' },
      }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={5} style={{ margin: 0, color: '#FFFFFF' }}>
              {session.name}
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{session.description}</Text>
          </div>
          <Badge
            status={session.active ? 'success' : 'default'}
            text={session.active ? 'Active' : 'Inactive'}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '12px' }}>{session.date}</Text>
          {session.active ? (
              <Button type="link" onClick={() => handleRejoin(session.id)} style={{ padding: 0 }}>
                Rejoin
              </Button>
          ) : (
              <Button type="link" onClick={() => navigate.push(`/session/${session.id}/review`)} style={{ padding: 0 }}>
                Review
              </Button>
          )}
        </div>
      </Space>
    </Card>
  );

  const tabItems = [
    {
      key: 'created',
      label: 'Created Sessions',
      children: (
        <div style={{ marginTop: 16 }}>
          {mockSessions.created.map((session) => renderSessionCard(session, true))}
        </div>
      ),
    },
    {
      key: 'joined',
      label: 'Joined Sessions',
      children: (
        <div style={{ marginTop: 16 }}>
          {mockSessions.joined.map((session) => renderSessionCard(session, false))}
        </div>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#0D0D1A' }}>
      <Header
        style={{
          background: '#0D0D1A',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Title level={3} style={{ margin: 0, color: '#FF2D7E' }}>
            Karaokee
          </Title>
        </div>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Text style={{ color: '#FFFFFF' }}>{username}</Text>
            <Avatar icon={<UserOutlined />} style={{ background: '#FF2D7E' }} />
          </div>
        </Dropdown>
      </Header>

      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Main Action Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 24,
              marginBottom: 48,
            }}
          >
            <Card
              hoverable
              onClick={handleCreateParty}
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)',
                border: 'none',
              }}
              styles={{
                body: { padding: '48px 24px' },
              }}
            >
              <Title level={3} style={{ color: '#FFFFFF', marginBottom: 8 }}>
                Create a Party 🎤
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Start a new karaoke session
              </Text>
            </Card>

            <Card
              hoverable
              onClick={handleJoinParty}
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #00C2FF 0%, #0091C7 100%)',
                border: 'none',
              }}
              styles={{
                body: { padding: '48px 24px' },
              }}
            >
              <Title level={3} style={{ color: '#FFFFFF', marginBottom: 8 }}>
                Join a Party 🎉
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Enter a session PIN
              </Text>
            </Card>
          </div>

          {/* Session History Tabs */}
          <Card>
            <Tabs items={tabItems} />
          </Card>
        </div>
      </Content>
    </Layout>
  );
}