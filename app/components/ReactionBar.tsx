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

const HEADER_HEIGHT = 56;
const SIDEBAR_WIDTH = 320;

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

interface ReactionBarProps {
  sessionId: string;
}

export default function ReactionBar({ sessionId }: ReactionBarProps) {
  const [floating, setFloating] = useState<FloatingReaction[]>([]);
  const nextId = useRef(0);

  const handleIncoming = useCallback((reaction: Reaction) => {
    const emoji = EMOJIS.find(e => e.type === reaction.type)?.emoji ?? "✨";

    const contentWidth = window.innerWidth - SIDEBAR_WIDTH;
    const contentHeight = window.innerHeight - HEADER_HEIGHT;

    // Spawn in the lower two thirds so there's room to float up
    const x = Math.random() * (contentWidth - 60) + 20;
    const y = HEADER_HEIGHT + contentHeight * (1 / 3) + Math.random() * contentHeight * (2 / 3) - 40;

    const id = nextId.current++;
    setFloating(prev => [...prev, { id, emoji, x, y }]);
    setTimeout(() => setFloating(prev => prev.filter(r => r.id !== id)), 2500);
  }, []);

  const { sendReaction } = useReactions({ sessionId, onReaction: handleIncoming });

  return (
    <>
      {/* Floating emojis — rendered over the full content area */}
      {floating.map(r => (
        <span
          key={r.id}
          style={{
            position: "fixed",
            left: r.x,
            top: r.y,
            fontSize: 36,
            animation: "floatUp 2.5s ease-out forwards",
            pointerEvents: "none",
            zIndex: 300,
          }}
        >
          {r.emoji}
        </span>
      ))}

      {/* Reaction buttons — fixed to the left edge, vertically centered */}
      <div
        style={{
          position: "fixed",
          left: 16,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
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
    </>
  );
}
