"use server";

import Redis from "ioredis";

// Redis cache key for M2M token
const M2M_TOKEN_CACHE_KEY = "cognito:m2m:token";

// Buffer time to refresh token before actual expiration (5 minutes in seconds)
const TOKEN_REFRESH_BUFFER_SECONDS = 5 * 60;

interface CognitoTokenResponse {
  access_token: string;
  expires_in: number; // seconds
  token_type: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
}

/**
 * AWS Cognito Machine-to-Machine (M2M) Token Service
 * Handles token acquisition and caching with Redis
 */
class CognitoM2MTokenService {
  private redis: Redis | null = null;
  private memoryCache: CachedToken | null = null;

  private readonly tokenEndpoint: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly scope: string;

  constructor() {
    // Cognito configuration from environment variables
    const cognitoDomain = process.env.COGNITO_DOMAIN;
    this.clientId = process.env.COGNITO_CLIENT_ID || "";
    this.clientSecret = process.env.COGNITO_CLIENT_SECRET || "";
    this.scope = process.env.COGNITO_SCOPE || "";

    if (!cognitoDomain) {
      throw new Error("COGNITO_DOMAIN environment variable is required");
    }

    // Cognito token endpoint
    this.tokenEndpoint = `${cognitoDomain}/oauth2/token`;
  }

  /**
   * Get Redis client (lazy initialization)
   */
  private getRedis(): Redis | null {
    if (this.redis) {
      return this.redis;
    }

    const redisUrl = process.env.TOKEN_CACHE_REDIS_URL;
    if (!redisUrl) {
      console.warn(
        "TOKEN_CACHE_REDIS_URL not configured, falling back to in-memory cache",
      );
      return null;
    }

    try {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
      });

      this.redis.on("error", (err: Error) => {
        console.error("Redis connection error:", err);
      });

      return this.redis;
    } catch (error) {
      console.error("Failed to initialize Redis:", error);
      return null;
    }
  }

  /**
   * Request a new M2M token from Cognito
   */
  private async requestNewToken(): Promise<CognitoTokenResponse> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        "COGNITO_CLIENT_ID and COGNITO_CLIENT_SECRET are required",
      );
    }

    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString("base64");

    const body = new URLSearchParams({
      grant_type: "client_credentials",
    });

    // Add scope if configured
    if (this.scope) {
      body.append("scope", this.scope);
    }

    const response = await fetch(this.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get M2M token from Cognito: ${response.status} - ${errorText}`,
      );
    }

    return response.json() as Promise<CognitoTokenResponse>;
  }

  /**
   * Get token from Redis cache
   */
  private async getFromRedisCache(): Promise<CachedToken | null> {
    const redis = this.getRedis();
    if (!redis) {
      return null;
    }

    try {
      const cached = await redis.get(M2M_TOKEN_CACHE_KEY);
      if (!cached) {
        return null;
      }

      const parsed = JSON.parse(cached) as CachedToken;

      // Check if token is still valid (with buffer)
      const now = Date.now();
      if (parsed.expiresAt - TOKEN_REFRESH_BUFFER_SECONDS * 1000 <= now) {
        // Token is expired or about to expire
        await redis.del(M2M_TOKEN_CACHE_KEY);
        return null;
      }

      return parsed;
    } catch (error) {
      console.error("Error reading from Redis cache:", error);
      return null;
    }
  }

  /**
   * Save token to Redis cache
   */
  private async saveToRedisCache(token: CachedToken): Promise<void> {
    const redis = this.getRedis();
    if (!redis) {
      return;
    }

    try {
      // Calculate TTL: expiration time minus buffer, in seconds
      const ttlMs =
        token.expiresAt - Date.now() - TOKEN_REFRESH_BUFFER_SECONDS * 1000;
      const ttlSeconds = Math.max(Math.floor(ttlMs / 1000), 0);

      if (ttlSeconds > 0) {
        await redis.setex(
          M2M_TOKEN_CACHE_KEY,
          ttlSeconds,
          JSON.stringify(token),
        );
      }
    } catch (error) {
      console.error("Error saving to Redis cache:", error);
    }
  }

  /**
   * Get token from memory cache (fallback when Redis is unavailable)
   */
  private getFromMemoryCache(): CachedToken | null {
    if (!this.memoryCache) {
      return null;
    }

    const now = Date.now();
    if (
      this.memoryCache.expiresAt - TOKEN_REFRESH_BUFFER_SECONDS * 1000 <=
      now
    ) {
      // Token is expired or about to expire
      this.memoryCache = null;
      return null;
    }

    return this.memoryCache;
  }

  /**
   * Save token to memory cache
   */
  private saveToMemoryCache(token: CachedToken): void {
    this.memoryCache = token;
  }

  /**
   * Get a valid M2M access token
   * Will return cached token if available and valid, otherwise requests a new one
   */
  async getAccessToken(): Promise<string> {
    // Try Redis cache first
    let cachedToken = await this.getFromRedisCache();

    // Fall back to memory cache if Redis is unavailable
    if (!cachedToken) {
      cachedToken = this.getFromMemoryCache();
    }

    if (cachedToken) {
      return cachedToken.accessToken;
    }

    // Request new token from Cognito
    const tokenResponse = await this.requestNewToken();

    // Calculate expiration timestamp
    const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

    const newToken: CachedToken = {
      accessToken: tokenResponse.access_token,
      expiresAt,
    };

    // Save to both caches
    await this.saveToRedisCache(newToken);
    this.saveToMemoryCache(newToken);

    return newToken.accessToken;
  }

  /**
   * Force refresh the token (invalidate cache and get new token)
   */
  async forceRefresh(): Promise<string> {
    const redis = this.getRedis();
    if (redis) {
      try {
        await redis.del(M2M_TOKEN_CACHE_KEY);
      } catch (error) {
        console.error("Error deleting token from Redis:", error);
      }
    }

    this.memoryCache = null;

    return this.getAccessToken();
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }
}

// Singleton instance
let tokenServiceInstance: CognitoM2MTokenService | null = null;

/**
 * Get the singleton instance of CognitoM2MTokenService
 */
export async function getCognitoM2MTokenService(): Promise<CognitoM2MTokenService> {
  if (!tokenServiceInstance) {
    tokenServiceInstance = new CognitoM2MTokenService();
  }
  return tokenServiceInstance;
}

/**
 * Get a valid M2M access token (convenience function)
 */
export async function getM2MAccessToken(): Promise<string> {
  const service = await getCognitoM2MTokenService();
  return await service.getAccessToken();
}
