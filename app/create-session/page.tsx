"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { ApplicationError } from "@/types/error";
import { Session } from "@/types/session";
import { Layout, Button, Input, Card, Steps, Typography, Form, Alert, ConfigProvider } from "antd";
import { ArrowLeftOutlined, CopyOutlined, CheckOutlined } from "@ant-design/icons";
import SongSearchContent from "@/components/SongSearchContent";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface SessionFormValues {
  name: string;
  description?: string;
}

export default function CreateSession() {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm<SessionFormValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pin, setPin] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const { set: setSessionId, value: sessionId } = useLocalStorage<string>("sessionId", "");

  const handleStartSession = async (values: SessionFormValues) => {
    setLoading(true);
    try {
      const data = await apiService.post<Session>("/sessions", values);
      setPin(data.gamePin);
      setSessionId(data.id);
      setCurrentStep(1);
    } catch (err) {
      const status = (err as ApplicationError).status;
      if (status) {
        setError(`Error creating session: ${status}`);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#0D0D1A" }}>
      <Header
        style={{
          background: "#0D0D1A",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/dashboard")}
          style={{ marginRight: 16, color: "#FFFFFF" }}
        >
          Back to Dashboard
        </Button>
        <Title level={3} style={{ margin: 0, color: "#FF2D7E" }}>
          Create New Session
        </Title>
      </Header>

      <Content style={{ padding: "48px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {/* Steps */}
          <Card
            style={{
              marginBottom: 32,
              background: "#1A1A2E",
              border: "1px solid rgba(255, 45, 126, 0.2)",
            }}
          >
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: "#FF2D7E",
                  colorText: "#FFFFFF",
                  colorTextDisabled: "rgba(255,255,255,0.35)",
                  colorTextLabel: "rgba(255,255,255,0.55)",
                  colorBorder: "rgba(255,255,255,0.35)",
                },
                components: {
                  Steps: { navArrowColor: "rgba(255,255,255,0.35)" },
                },
              }}
            >
              <Steps
                current={currentStep}
                items={[0, 1, 2].map((i, _, arr) => {
                  const labels = ["Setup", "Session Created", "Add First Song"];
                  const done = currentStep > i;
                  const active = currentStep === i;
                  return {
                    title: <span style={{ color: done ? "#FF2D7E" : active ? "#FFFFFF" : "rgba(255,255,255,0.55)" }}>{labels[i]}</span>,
                    icon: done ? (
                      <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#FF2D7E", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF" }}>
                        <CheckOutlined />
                      </span>
                    ) : undefined,
                  };
                })}
              />
            </ConfigProvider>
          </Card>

          {/* Main Form Card */}
          <Card>
            {error && (
              <Alert
                type="error"
                description={error}
                closable
                style={{ marginBottom: 24 }}
              />
            )}

            <Form form={form} layout="vertical" onFinish={handleStartSession}>
              {currentStep === 0 && (
                <>
                  <Form.Item
                    name="name"
                    label="Session Name"
                    rules={[{ required: true, message: "Please enter a session name" }]}
                  >
                    <Input size="large" placeholder="Enter session name" />
                  </Form.Item>

                  <Form.Item name="description" label="Description">
                    <TextArea
                      size="large"
                      placeholder="Add a description (optional)"
                      rows={4}
                    />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      type="primary"
                      size="large"
                      block
                      htmlType="submit"
                      loading={loading}
                      style={{ marginTop: 24, height: 56, fontSize: 18, fontWeight: 600 }}
                    >
                      Start the session to generate a PIN
                    </Button>
                  </Form.Item>
                </>
              )}

              {currentStep === 1 && (
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <Text strong style={{ fontSize: 16, display: "block", marginBottom: 16 }}>
                    Session PIN
                  </Text>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #FF2D7E 0%, #C91F5E 100%)",
                      padding: "32px",
                      borderRadius: 16,
                      marginBottom: 16,
                    }}
                  >
                    <Text
                      copyable={{ icon: [<CopyOutlined style={{ fontSize: 28, color: "#00C2FF" }} />, <CheckOutlined style={{ fontSize: 28, color: "#52c41a" }} />] }}
                      style={{
                        color: "#FFFFFF",
                        fontSize: 64,
                        letterSpacing: 16,
                        fontWeight: 700,
                        display: "block",
                      }}
                    >
                      {pin}
                    </Text>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    block
                    style={{ marginTop: 12 }}
                    onClick={() => setCurrentStep(2)}
                  >
                    Continue → Add First Song
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div style={{ padding: "8px 0" }}>
                  <Title level={4} style={{ color: "#FFFFFF", marginBottom: 8 }}>
                    Add a song to your queue
                  </Title>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.65)",
                      display: "block",
                      marginBottom: 24,
                    }}
                  >
                    Add at least one song before entering the lobby.
                  </Text>
                  <SongSearchContent
                    sessionId={sessionId}
                    onSongAdded={() => router.push(`/sessions/${sessionId}`)}
                  />
                </div>
              )}
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
