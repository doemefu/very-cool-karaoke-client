import process from "process";
import { isProduction } from "@/utils/environment";
/**
 * Returns the API base URL based on the current environment.
 * In production it retrieves the URL from NEXT_PUBLIC_PROD_API_URL (or falls back to a hardcoded url).
 * In development, it returns "http://localhost:8080".
 */
export function getApiDomain(): string {
  const prodUrl = process.env.NEXT_PUBLIC_PROD_API_URL ||
    "https://karaoke-server-275473246224.europe-west6.run.app";
  const devUrl = "http://127.0.0.1:8080";
  return isProduction() ? prodUrl : devUrl;
}
