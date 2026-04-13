"use client";

import { useState, useCallback } from "react";
import { useReactions } from "@/hooks/useReactions";
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

let nextId = 0;

export default function ReactionBar({ sessionId }: ReactionBarProps) {
    const [floating, setFloating] = useState<FloatingReaction[]>([]);

    const handleIncoming = useCallback((reaction: Reaction) => {
        const emoji = EMOJIS.find(e => e.type === reaction.type)?.emoji ?? "✨";
        const id = nextId++;
        setFloating(prev => [...prev, { id, emoji, x: Math.random() * 80 + 10 }]);
        setTimeout(() => setFloating(prev => prev.filter(r => r.id !== id)), 1500);
    }, []);

    const { sendReaction } = useReactions({ sessionId, onReaction: handleIncoming });

    return (
        <div
            style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "100%",
                display: "flex",
                justifyContent: "center",
                zIndex: 200,
                padding: "12px 16px",
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
                <div style={{ display: "flex", gap: 12, justifyContent: "center", padding: "16px 0" }}>
                    {EMOJIS.map(({ emoji, type }) => (
                        <button
                            key={type}
                            onClick={() => sendReaction(type)}
                            style={{
                                fontSize: 28,
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: 12,
                                padding: "10px 18px",
                                cursor: "pointer",
                                transition: "transform 0.1s",
                            }}
                            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.9)")}
                            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>

                <style>{`
                @keyframes floatUp {
                    0%   { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-80px); }
                }
            `}</style>

            </div>
        </div>
    );
}