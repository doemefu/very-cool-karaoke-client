
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Layout, Card, Input, Button, Tabs, Alert, Typography, Form } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
// import { useNavigate } from 'react-router';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function Page() {
  const navigate = useRouter();
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = (values: any) => {
    setError('');
    // Mock login validation
    if (!values.username || !values.password) {
      setError('Please enter both username and password');
      return;
    }
    // Mock successful login
    navigate.push('/dashboard');
  };

  const handleRegister = (values: any) => {
    setError('');
    // Mock registration validation
    if (!values.username || !values.password || !values.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (values.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    // Mock successful registration
    navigate.push('/dashboard');
  };

  const loginTab = (
    <Form form={loginForm} onFinish={handleLogin} layout="vertical" size="large">
      <Form.Item
        name="username"
        rules={[{ required: true, message: 'Please enter your username' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Username" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please enter your password' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" size="large" block>
          Login
        </Button>
      </Form.Item>
    </Form>
  );

  const registerTab = (
    <Form form={registerForm} onFinish={handleRegister} layout="vertical" size="large">
      <Form.Item
        name="username"
        rules={[{ required: true, message: 'Please enter a username' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Username" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: 'Please enter a password' },
          { min: 6, message: 'Password must be at least 6 characters' },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Please confirm your password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords do not match'));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" size="large" block>
          Register
        </Button>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    {
      key: 'login',
      label: 'Login',
      children: loginTab,
    },
    {
      key: 'register',
      label: 'Register',
      children: registerTab,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#0D0D1A' }}>
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1200,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 48,
            alignItems: 'center',
          }}
        >
          {/* Left Column - Branding */}
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Title
              level={1}
              style={{
                color: '#FF2D7E',
                fontSize: 64,
                marginBottom: 24,
                fontWeight: 800,
              }}
            >
              Karaokee
            </Title>
            <Text
              style={{
                color: '#00C2FF',
                fontSize: 28,
                fontWeight: 300,
                display: 'block',
              }}
            >
              Your night. Your songs.
            </Text>
            <div
              style={{
                marginTop: 48,
                fontSize: 80,
                opacity: 0.3,
              }}
            >
              🎤
            </div>
          </div>

          {/* Right Column - Auth Forms */}
          <Card style={{ maxWidth: 500, width: '100%', margin: '0 auto' }}>
            {error && (
              <Alert
                message={error}
                type="error"
                closable
                onClose={() => setError('')}
                style={{ marginBottom: 24 }}
              />
            )}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              size="large"
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
