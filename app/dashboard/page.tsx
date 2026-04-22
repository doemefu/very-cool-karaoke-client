"use client";

import React from "react";
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Avatar, Card, Dropdown, Layout, Typography } from 'antd';
import { LockOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const router = useRouter();

  const { clear: clearToken } = useLocalStorage<string>('token', '');
  const { clear: clearUserId } = useLocalStorage<string>('id', '');
  const { clear: clearUsername, value: username } = useLocalStorage<string>('username', '');

  const handleLogout = () => {
    clearToken();
    clearUserId();
    clearUsername();
    router.push('/');
  };

  const userMenuItems = [
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: 'Change Password',
      onClick: () => router.push('/change-password'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#0D0D1A' }}>
      <Header
        style={{
          background: '#0D0D1A',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
        }}
      >
        <Title level={3} style={{ margin: 0, color: '#FF2D7E' }}>
          Karaokee
        </Title>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Text style={{ color: '#FFFFFF' }}>{username || 'User'}</Text>
            <Avatar icon={<UserOutlined />} style={{ background: '#FF2D7E' }} />
          </div>
        </Dropdown>
      </Header>

      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 24,
          }}
        >
          <Card
            hoverable
            onClick={() => router.push('/create-session')}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)',
              border: 'none',
            }}
            styles={{ body: { padding: '48px 24px' } }}
          >
            <Title level={3} style={{ color: '#FFFFFF', marginBottom: 8 }}>
              Create a Party 🎤
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Start a new karaoke session</Text>
          </Card>

          <Card
            hoverable
            onClick={() => router.push('/join-session')}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #00C2FF 0%, #0091C7 100%)',
              border: 'none',
            }}
            styles={{ body: { padding: '48px 24px' } }}
          >
            <Title level={3} style={{ color: '#FFFFFF', marginBottom: 8 }}>
              Join a Party 🎉
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Enter a session PIN</Text>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default Dashboard;