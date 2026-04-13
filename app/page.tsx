"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Layout, Card, Input, Button, Tabs, Alert, Typography, Form } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import {ApplicationError} from "@/types/error";

interface RegisterFormValues {
  username: string;
  password: string;
  confirmPassword: string;
}

interface LoginFormValues {
  username: string;
  password: string;
}


const { Content } = Layout;
const { Title, Text } = Typography;



const LandingPage: React.FC =() => {
  const router = useRouter();
  const apiService = useApi();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleRegister = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const { username, password } = values;

      const response = await apiService.post<User>("/users", { username, password });
      console.log(response);

      if (response.token) {
        sessionStorage.setItem("token", JSON.stringify(response.token));
      }
      if (response.id) {
        sessionStorage.setItem("id", JSON.stringify(String(response.id)));
      }

      router.push(`/dashboard`);

    } catch (error) {
        // Network error: fetch throws TypeError when server is unreachable
        if (error instanceof TypeError) {
            setError("Server unreachable. Please check your connection.");
            return;
        }

        // API error with status code
        const status = (error as ApplicationError).status;

        if (status === 409) {
            registerForm.setFields([
                {
                  name: "username",
                  errors: ["Username already taken, please choose another"],
                 },
            ]);

        } else {
            setError("Registration failed. Please try again.");
        }
    } finally {
        setLoading(false);
    }
  };

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      // Call the API service and let it handle JSON serialization and error handling
      const response = await apiService.post<User>("/auth/login", values);

      if (response.token) {
        sessionStorage.setItem("token", JSON.stringify(response.token));
      }
      if (response.id) {
        sessionStorage.setItem("id", JSON.stringify(String(response.id)));
      }

      // Navigate to the user overview
      router.push("/dashboard");
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("401")) {
                setError("Invalid credentials. Please check your username and password.");
            } else {
                setError("Server unreachable. Please check your connection.");
            }
        } else {
            console.error("An unknown error occurred during login.");
        }
    } finally {
      setLoading(false);
    }
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
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
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
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
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
                      title={error}
                      type="error"
                      closable={{}}
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
};

export default LandingPage;