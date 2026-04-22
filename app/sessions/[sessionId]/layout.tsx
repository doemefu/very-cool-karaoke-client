"use client";

import { StompProvider } from "@/context/StompContext";
import { ReactNode } from "react";

export default function SessionGroupLayout({ children }: { children: ReactNode }) {
    return <StompProvider>{children}</StompProvider>;
}