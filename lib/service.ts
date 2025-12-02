import ky from "ky";

import { jyAPIbaseUrl } from "./httpBase";

// Ky instance for calling Next.js API routes
export const nextApi = ky.create({
  prefixUrl: "/api",
  credentials: "include",
  timeout: 30000,
  retry: { limit: 2 },
});

// Server-side only: Get the API token from environment variables
const getApiToken = () => {
  if (typeof window !== "undefined") {
    return undefined;
  }
  return process.env.DRAFT_API_TOKEN;
};

// Ky instance for calling external JY API (server-side with auth)
export const jyApi = ky.create({
  prefixUrl: jyAPIbaseUrl,
  timeout: 30000,
  retry: { limit: 1 },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = getApiToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
  },
});
