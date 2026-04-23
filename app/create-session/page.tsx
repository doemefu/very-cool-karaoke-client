"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { ApplicationError } from "@/types/error";
import { Session } from "@/types/session";
import { Layout, Button, Input, Card, Steps, Typography, Form, Alert } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

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
  const [sessionCreated, setSessionCreated] = useState(false);

  const { set: setSessionId, value: sessionId } = useLocalStorage<string>("sessionId", "");

  const currentStep = !sessionCreated ? 0 : 1;

  const handleStartSession = async (values: SessionFormValues) => {
    setLoading(true);
    try {
      const data = await apiService.post<Session>("/sessions", values);
      setPin(data.gamePin);
      setSessionId(data.id);
      setSessionCreated(true);
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
          <Card style={{ marginBottom: 32 }}>
            <Steps
              current={currentStep}
              items={[
                { title: "Setup" },
                { title: "Session Created" },
              ]}
            />
          </Card>

          {/* Main Form Card */}
          <Card>
            {error && (
              <Alert
                type="error"
                description={error}
                style={{ marginBottom: 24 }}
              />
            )}

            <Form form={form} layout="vertical" onFinish={handleStartSession}>
              {!sessionCreated && (
                <>
                  <Form.Item
                    name="name"
                    label="Session Name"
                    rules={[{ required: true, message: "Please enter a session name" }]}
                  >
                    <Input size="large" placeholder="Enter session name" />
                  </Form.Item>

                  <Form.Item name="description" label="Description">
                    <TextArea size="large" placeholder="Add a description (optional)" rows={4} />
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

              {sessionCreated && (
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
                    {pin ? (
                      <Title
                        level={1}
                        style={{
                          margin: 0,
                          color: "#FFFFFF",
                          fontSize: 64,
                          letterSpacing: 16,
                          fontWeight: 700,
                        }}
                      >
                        {pin}
                      </Title>
                    ) : (
                      <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 18 }}>
                        Start the session to generate a PIN
                      </Text>
                    )}
                  </div>
                  <Button
                    type="default"
                    size="large"
                    block
                    style={{
                      marginTop: 16,
                      background: "transparent",
                      borderColor: "#00C2FF",
                      color: "#00C2FF",
                    }}
                    onClick={() => navigator.clipboard.writeText(pin)}
                  >
                    Copy Party Pin
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    block
                    style={{ marginTop: 12 }}
                    onClick={() => router.push(`/sessions/${sessionId}`)}
                  >
                    Go to Lobby
                  </Button>
                </div>
              )}
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
