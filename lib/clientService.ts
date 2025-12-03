import ky from "ky";

// Ky instance for calling Next.js API routes
export const nextApi = ky.create({
  prefixUrl: "/api",
  credentials: "include",
  timeout: 30000,
  retry: { limit: 2 },
});
