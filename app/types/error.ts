"use client";

export interface ApplicationError extends Error {
  info: string;
  status: number;
}
