"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Button, Input, Card, Steps, Typography, Space, message, Form } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useApi } from '@/hooks/useApi';
import { Session } from '@/types/session';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CreateSession() {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionCreated, setSessionCreated] = useState(false);



  const handleStartSession = async (values: { name: string, description?: string }) => {
    setLoading(true);
    try {
      const data = await apiService.post<Session>('/sessions', values);
      setPin(data.gamePin);
      setSessionId(data.id);
      setSessionCreated(true);
      message.success('Session created successfully!');
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Error creating session: ${error.message}`);
      }
    } finally {
      setLoading(false);
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
          Create New Session
        </Title>
      </Header>

      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Steps */}
          <Card style={{ marginBottom: 32 }}>
            <Steps
              current={sessionCreated ? 1 : 0}
              items={[
                { title: 'Setup' },
                { title: 'Invite' },
                { title: 'Party' },
              ]}
            />
          </Card>

          {/* Main Form Card */}
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleStartSession}
              disabled={sessionCreated}
            >
              {!sessionCreated && (
                <>
                  <Form.Item
                    name="name"
                    label={<Text strong style={{ color: '#FFFFFF', fontSize: 16 }}>Session Name</Text>}
                    rules={[{ required: true, message: 'Please enter a session name' }]}
                  >
                    <Input size="large" placeholder="Enter session name" />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label={<Text strong style={{ color: '#FFFFFF', fontSize: 16 }}>Description</Text>}
                  >
                    <TextArea size="large" placeholder="Add a description (optional)" rows={4} />
                  </Form.Item>
                </>
              )}

{sessionCreated && (
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
                    <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 18 }}>
                      Start the session to generate a PIN
                    </Text>
                  )}
                </div>
                {sessionId && (
                  <Button
                    size="large"
                    block
                    style={{ marginTop: 16 , color: "white"}}
                  // onClick={() => router.push(`/session/${sessionId}`)} TODO: implement session page and uncomment this line to navigate to the session lobby
                  >
                    Go to Lobby
                  </Button>
                )}
              </div>
)}
              {!sessionCreated && (
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    htmlType="submit"
                    loading={loading}
                    style={{
                      marginTop: 24,
                      height: 56,
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >
                    Start the session to generate a PIN
                  </Button>
                </Form.Item>
              )}
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
