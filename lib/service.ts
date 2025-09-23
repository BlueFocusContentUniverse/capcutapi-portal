"use client";

import ky from "ky";

import { jyAPIbaseUrl } from "./httpBase";

// Ky instance for calling Next.js API routes
export const nextApi = ky.create({
  prefixUrl: "/api",
  credentials: "include",
  timeout: 30000,
  retry: { limit: 2 },
});

// Ky instance for calling external JY API
export const jyApi = ky.create({
  prefixUrl: jyAPIbaseUrl,
  timeout: 30000,
  retry: { limit: 1 },
});
