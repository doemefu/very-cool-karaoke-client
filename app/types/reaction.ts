export type ReactionType = "CLAP" | "FIRE" | "HEART" | "LAUGH" | "PARTY_POPPER";

export interface Reaction {
    type: ReactionType;
    id: string;
}

