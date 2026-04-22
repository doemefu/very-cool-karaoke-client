"use client";

import { useEffect, useState } from 'react';
import { Avatar, Badge, Button, Dropdown, Flex, Layout, Tabs, Typography } from 'antd';
import { LockOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useApi } from '@/hooks/useApi';
import { Session, SessionStatus } from '@/types/session';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const ACTIVE_STATUSES: SessionStatus[] = ["CREATED", "ACTIVE", "PAUSED"];

function SessionCard({ session, onRejoin }: { session: Session; onRejoin: (id: string) => void }) {
  const isActive = session.status && ACTIVE_STATUSES.includes(session.status);
  const createdAt = session.createdAt ? new Date(session.createdAt).toLocaleDateString() : "—";

  return (
    <div
      style={{
        background: "#1A1A2E",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <Flex vertical gap={8} style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <Title level={5} style={{ margin: 0, color: "#FFFFFF" }}>
              {session.name ?? `Session ${session.id}`}
            </Title>
            {session.description && (
              <Text style={{ color: "rgba(255,255,255,0.65)" }}>{session.description}</Text>
            )}
          </div>
          <Badge
            status={isActive ? "success" : "default"}
            text={<Text style={{ color: isActive ? "#52c41a" : "rgba(255,255,255,0.35)", fontSize: 12 }}>{isActive ? "Active" : "Inactive"}</Text>}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{createdAt}</Text>
          {isActive && (
            <Button type="link" onClick={() => onRejoin(session.id)} style={{ padding: 0 }}>
              Rejoin
            </Button>
          )}
        </div>
      </Flex>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const apiService = useApi();

  const { value: username } = useLocalStorage<string>('username', '');
  const { value: userId } = useLocalStorage<string>('id', '');
  const { clear: clearToken } = useLocalStorage<string>('token', '');

  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!userId) return;
    apiService.get<Session[]>(`/users/${userId}/sessions`)
      .then(setSessions)
      .catch(() => {/* silently ignore */});
  }, [userId, apiService]);

  const handleLogout = () => {
    clearToken();
    router.push('/');
  };

  const handleRejoin = (sessionId: string) => {
    localStorage.setItem('sessionId', sessionId);
    router.push(`/sessions/${sessionId}`);
  };

  const createdSessions = sessions.filter((s) => s.admin && String(s.admin.id) === String(userId));
  const joinedSessions  = sessions.filter((s) => !s.admin || String(s.admin.id) !== String(userId));

  const userMenuItems = [
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: 'Change Password',
      onClick: () => router.push('/change-password'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const tabItems = [
    {
      key: 'created',
      label: 'Created Sessions',
      children: (
        <div style={{ marginTop: 16 }}>
          {createdSessions.length === 0
            ? <Text style={{ color: "rgba(255,255,255,0.3)" }}>No created sessions yet</Text>
            : createdSessions.map((s) => <SessionCard key={s.id} session={s} onRejoin={handleRejoin} />)
          }
        </div>
      ),
    },
    {
      key: 'joined',
      label: 'Joined Sessions',
      children: (
        <div style={{ marginTop: 16 }}>
          {joinedSessions.length === 0
            ? <Text style={{ color: "rgba(255,255,255,0.3)" }}>No joined sessions yet</Text>
            : joinedSessions.map((s) => <SessionCard key={s.id} session={s} onRejoin={handleRejoin} />)
          }
        </div>
      ),
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

      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Action cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 48 }}>
            <div
              onClick={() => router.push('/create-session')}
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)',
                borderRadius: 8,
                padding: '48px 24px',
              }}
            >
              <Title level={3} style={{ color: '#FFFFFF', marginBottom: 8 }}>Create a Party 🎤</Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Start a new karaoke session</Text>
            </div>

            <div
              onClick={() => router.push('/join-session')}
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #00C2FF 0%, #0091C7 100%)',
                borderRadius: 8,
                padding: '48px 24px',
              }}
            >
              <Title level={3} style={{ color: '#FFFFFF', marginBottom: 8 }}>Join a Party 🎉</Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Enter a session PIN</Text>
            </div>
          </div>

          {/* Session history tabs */}
          <div style={{ background: "#1A1A2E", borderRadius: 12, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
            <Tabs items={tabItems} />
          </div>

        </div>
      </Content>
    </Layout>
  );
}
