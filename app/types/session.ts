export type SessionStatus = "CREATED" | "ACTIVE" | "PAUSED" | "ENDED";

export interface Participant {
  id: number;
  username: string;
}

export interface Session {
    id: string;
    gamePin: string;
    name?: string;
    description?: string;
    status?: SessionStatus;
    createdAt?: string;
    admin?: Participant;
    participants?: Participant[];
    requiresSongSelection?: boolean;
}
