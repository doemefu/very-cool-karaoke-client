"use client";

import { useState, useCallback, useRef } from "react";
import { useReactions } from "@/hooks/useReactions";
import { Button } from "antd";
import { Reaction, ReactionType } from "@/types/reaction";

const EMOJIS: { emoji: string; type: ReactionType }[] = [
  { emoji: "👏", type: "CLAP" },
  { emoji: "🔥", type: "FIRE" },
  { emoji: "❤️", type: "HEART" },
  { emoji: "😂", type: "LAUGH" },
  { emoji: "🎉", type: "PARTY_POPPER" },
];

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

interface ReactionBarProps {
  sessionId: string;
}

export default function ReactionBar({ sessionId }: ReactionBarProps) {
  const [floating, setFloating] = useState<FloatingReaction[]>([]);
  const nextId = useRef(0);

  const handleIncoming = useCallback((reaction: Reaction) => {
    const emoji = EMOJIS.find(e => e.type === reaction.type)?.emoji ?? "✨";
    const id = nextId.current++;
    setFloating(prev => [...prev, { id, emoji, x: Math.random() * 80 + 10 }]);
    setTimeout(() => setFloating(prev => prev.filter(r => r.id !== id)), 1500);
  }, []);

  const { sendReaction } = useReactions({ sessionId, onReaction: handleIncoming });

  return (
    <div
      style={{
        position: "fixed",
        left: 16,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 200,
        pointerEvents: "none",
      }}
    >
      <div style={{ position: "relative", pointerEvents: "auto" }}>

        {/* Floating animations */}
        {floating.map(r => (
          <span
            key={r.id}
            style={{
              position: "absolute",
              bottom: 60,
              left: `${r.x}%`,
              fontSize: 28,
              animation: "floatUp 1.5s ease-out forwards",
              pointerEvents: "none",
            }}
          >
            {r.emoji}
          </span>
        ))}

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {EMOJIS.map(({ emoji, type }) => (
            <Button
              key={type}
              className="reaction-btn"
              onClick={() => sendReaction(type)}
              style={{
                fontSize: 28,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: "10px 14px",
                height: "auto",
                transition: "transform 0.1s",
              }}
            >
              {emoji}
            </Button>
          ))}
        </div>

      </div>
    </div>
  );
}
