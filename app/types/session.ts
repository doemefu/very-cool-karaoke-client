export interface Session {
    id: string;
    gamePin: string;
    name?: string;
    description?: string;
    status?: string;
    admin?: { id: number; username: string };
}
