"use server";

import ky from "ky";

import { getM2MAccessToken } from "./cognito-m2m-token";

const jyAPIbaseUrl = process.env.JYAPI_BASEURL;

// Ky instance for calling external JY API (server-side with M2M auth)
export const jyApi = ky.create({
  prefixUrl: jyAPIbaseUrl,
  timeout: 30000,
  retry: { limit: 1 },
  hooks: {
    beforeRequest: [
      async (request) => {
        try {
          const token = await getM2MAccessToken();
          if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
          }
        } catch (error) {
          console.error("Failed to get M2M token for JY API:", error);
          throw error;
        }
      },
    ],
  },
});
