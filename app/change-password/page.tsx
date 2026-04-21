"use client";

import { useState } from 'react';
import { Layout, Card, Input, Button, Typography, Form, Alert } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import useLocalStorage from '@/hooks/useLocalStorage';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function ChangePassword() {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { value: userId } = useLocalStorage<string>('id', '');

  const handleSubmit = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.put(`/users/${userId}`, {
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setSuccess(true);
      form.resetFields();
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 403) {
        setError('Current password is incorrect.');
      } else {
        setError('Something went wrong. Please try again.');
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
          Change Password
        </Title>
      </Header>

      <Content
        style={{
          padding: '48px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card style={{ width: '100%', maxWidth: 500 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <LockOutlined style={{ fontSize: 32, color: '#FFFFFF' }} />
            </div>
            <Title level={3} style={{ color: '#FFFFFF', marginBottom: 8 }}>
              Update Your Password
            </Title>
            {/* <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
              Keep your account secure with a strong password
            </Text> */}
          </div>

          <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
            {error && (
              <Alert
                type="error"
                description={<span style={{ color: '#FFFFFF' }}>{error}</span>}
                style={{
                  marginBottom: 24,
                  background: 'rgba(255, 45, 126, 0.15)',
                  border: '1px solid rgba(255, 45, 126, 0.4)',
                }}
              />
            )}
            {success && (
              <Alert
                type="success"
                description={<span style={{ color: '#FFFFFF' }}>Password changed! Redirecting...</span>}
                style={{
                  marginBottom: 24,
                  background: 'rgba(0, 194, 255, 0.15)',
                  border: '1px solid rgba(0, 194, 255, 0.4)',
                }}
              />
            )}

            <Form.Item
              name="currentPassword"
              label={<span style={{ color: '#FFFFFF' }}>Current Password</span>}
              rules={[{ required: true, message: 'Please enter your current password' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Enter current password" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label={<span style={{ color: '#FFFFFF' }}>New Password</span>}
              rules={[
                { required: true, message: 'Please enter a new password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<span style={{ color: '#FFFFFF' }}>Confirm New Password</span>}
              dependencies={['newPassword']}
              hasFeedback
              rules={[
                { required: true, message: 'Please confirm your new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
            </Form.Item>

            <Form.Item style={{ marginTop: 32 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{ height: 56, fontSize: 18, fontWeight: 600 }}
              >
                Save New Password
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 14 }}>
              Make sure your password is at least 6 characters long
            </Text>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}
