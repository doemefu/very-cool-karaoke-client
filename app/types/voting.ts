import { Song } from "./song";

export type VotingStatus = "OPEN" | "CLOSED";

export interface VotingRound {
  id: number;
  roundNumber: number;
  status: VotingStatus;
  startedAt: string;
  endsAt: string | null;
  candidates: Song[]; // Song hat bereits currentVoteCount
}