"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering


import { Card, Typography, Layout } from 'antd';
import { useRouter } from 'next/navigation';
import { useApi } from "@/hooks/useApi";

const { Title, Text } = Typography;
const { Content } = Layout;

export default function Dashboard() {
  const router = useRouter();
  const apiService = useApi();

  const handleCreateParty = async () => {
    router.push('/create-session');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#0D0D1A' }}>
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 24px',
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
            width: 350,
            borderRadius: 16,
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
      </Content>
    </Layout>
  );
}
