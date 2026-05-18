"use client";

import { Button, Typography, Badge, Alert, Avatar } from "antd";
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import { Participant } from "@/types/session";
import { HEADER_HEIGHT } from "@/constants/dimensions";

const { Text, Title } = Typography;

interface WaitingLobbyProps {
  sessionName: string;
  gamePin: string;
  participants: Participant[];
  isAdmin: boolean;
  error: string;
  startingSession: boolean;
  onStart: () => void;
  onBack: () => void;
}

export default function WaitingLobby({ sessionName, gamePin, participants, isAdmin, error, startingSession, onStart, onBack }: WaitingLobbyProps) {
  return (
    <div style={{ minHeight: "100vh", background: "#0D0D1A", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          background: "rgba(13, 13, 26, 0.97)",
          borderBottom: "1px solid rgba(255, 45, 126, 0.20)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          height: HEADER_HEIGHT,
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ color: "#FFFFFF" }}
        >
          Back to Dashboard
        </Button>
        {gamePin && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>PIN</Text>
            <Text style={{ color: "#FF2D7E", fontWeight: 700, fontSize: 20, letterSpacing: "0.18em" }}>
              {gamePin}
            </Text>
          </div>
        )}
        <div style={{ width: 160 }} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: 40 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12, filter: "drop-shadow(0 0 20px rgba(255, 45, 126, 0.5))" }}>
            🎤
          </div>
          <Title level={2} style={{ color: "#FFFFFF", margin: 0, fontSize: 28, fontWeight: 700 }}>
            {sessionName || "Karaoke Session"}
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, display: "block", marginTop: 8 }}>
            {isAdmin ? "Everyone ready? Let's get this party started!" : "Waiting for the party to begin..."}
          </Text>
        </div>

        {gamePin && (
          <div style={{ background: "rgba(255, 45, 126, 0.08)", border: "1px solid rgba(255, 45, 126, 0.30)", borderRadius: 12, padding: "16px 40px", textAlign: "center" }}>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
              Join with PIN
            </Text>
            <Text style={{ color: "#FF2D7E", fontSize: 34, fontWeight: 800, letterSpacing: "0.22em" }}>
              {gamePin}
            </Text>
          </div>
        )}

        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 12, padding: "16px 24px", width: "100%", maxWidth: 400 }}>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 12 }}>
            Participants{" "}
            <Badge count={participants.length} style={{ backgroundColor: "#FF2D7E" }} />
          </Text>
          {participants.length === 0 ? (
            <Text style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No participants yet...</Text>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {participants.map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar size={30} icon={<UserOutlined />} style={{ background: "rgba(255, 45, 126, 0.3)", flexShrink: 0 }} />
                  <Text style={{ color: "#FFFFFF", fontSize: 14 }}>{p.username}</Text>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <Alert type="error" description={error} closable style={{ maxWidth: 400, width: "100%" }} />
        )}

        {isAdmin && (
          <Button type="primary" size="large" loading={startingSession} onClick={onStart} style={{ height: 56, fontSize: 18, fontWeight: 600 }}>
            🎉 Start the Party
          </Button>
        )}

        {!isAdmin && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 8, height: 8, borderRadius: "50%", background: "#FF2D7E",
                    animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`, opacity: 0.7,
                  }}
                />
              ))}
              <style>{`
                @keyframes pulse {
                  0%, 100% { transform: scale(1); opacity: 0.4; }
                  50% { transform: scale(1.4); opacity: 1; }
                }
              `}</style>
            </div>
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
              Waiting for the Admin to start the Party...
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
