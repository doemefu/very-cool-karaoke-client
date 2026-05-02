export type SessionStatus = "CREATED" | "ACTIVE" | "PAUSED" | "ENDED";

export interface Session {
    id: string;
    gamePin: string;
    name?: string;
    description?: string;
    status?: SessionStatus;
    createdAt?: string;
    admin?: { id: number; username: string };
    participants?: { id: number; username: string }[];
}
