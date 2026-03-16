"use client";

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { Layout, Card, Input, Button, Steps, Typography, Space, message } from 'antd';
import { ArrowLeftOutlined, ShareAltOutlined} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CreateSession() {
    const navigate = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [sessionName, setSessionName] = useState('');
    const [description, setDescription] = useState('');
    const [pin, setPin] = useState('');

    const handleNext = () => {
        if (!sessionName.trim()) {
            message.error('Please enter a session name');
            return;
        }
        // Auto-generate PIN when moving to step 2
        const newPin = Math.floor(100000 + Math.random() * 900000).toString();
        setPin(newPin);
        setCurrentStep(1);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: sessionName,
                text: `Join my session "${sessionName}" with PIN: ${pin}`,
            });
        } else {
            navigator.clipboard.writeText(`Join my session "${sessionName}" with PIN: ${pin}`);
            message.success('Copied to clipboard!');
        }
    };

    const handleCreateSession = () => {
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
                    onClick={() => currentStep === 1 ? setCurrentStep(0) : navigate.push('/dashboard')}
                    style={{ marginRight: 16, color: '#FFFFFF' }}
                >
                    {currentStep === 1 ? 'Back' : 'Back to Dashboard'}
                </Button>
                <Title level={3} style={{ margin: 0, color: '#FF2D7E' }}>
                    Create New Session
                </Title>
            </Header>

            <Content style={{ padding: '48px 24px' }}>
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    {/* Steps */}
                    <Card style={{ marginBottom: 32 }}>
                        <Steps
                            current={currentStep}
                            items={[
                                { title: 'Setup' },
                                { title: 'Your PIN' },
                            ]}
                        />
                    </Card>

                    {/* Step 1: Session Details */}
                    {currentStep === 0 && (
                        <Card>
                            <Space orientation="vertical" size={24} style={{ width: '100%' }}>
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

                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    onClick={handleNext}
                                    style={{
                                        marginTop: 24,
                                        height: 56,
                                        fontSize: 18,
                                        fontWeight: 600,
                                    }}
                                >
                                    Next →
                                </Button>
                            </Space>
                        </Card>
                    )}

                    {/* Step 2: PIN Display */}
                    {currentStep === 1 && (
                        <Card>
                            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                                <Title level={2} style={{ color: '#FFFFFF', marginBottom: 8 }}>
                                    Your Session PIN
                                </Title>
                                <Text
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.65)',
                                        display: 'block',
                                        marginBottom: 48,
                                    }}
                                >
                                    Share this PIN with your guests so they can join <strong style={{ color: '#FFFFFF' }}>{sessionName}</strong>
                                </Text>

                                {/* PIN Card — styled like the selected-song card in JoinSession */}
                                <Card
                                    style={{
                                        background: 'linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)',
                                        border: 'none',
                                        marginBottom: 24,
                                        borderRadius: 16,
                                    }}
                                >
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
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
                                    </div>
                                </Card>

                                {/* Share Button */}
                                <Button
                                    size="large"
                                    block
                                    icon={<ShareAltOutlined />}
                                    onClick={handleShare}
                                    style={{ marginBottom: 16, height: 48, fontSize: 16 }}
                                >
                                    Share PIN
                                </Button>

                                {/* Create Session Button */}
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    onClick={handleCreateSession}
                                    style={{ height: 56, fontSize: 18, fontWeight: 600 }}
                                >
                                    Create Session 🎶
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </Content>
        </Layout>
    );
}