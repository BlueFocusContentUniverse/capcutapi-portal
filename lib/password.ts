// Uses Web Crypto API (SubtleCrypto) PBKDF2-HMAC-SHA-256
// Hash format: pbkdf2:<iterations>:<saltBase64>:<hashBase64>

const subtle = crypto.subtle;

const ITERATIONS = 310_000; // per modern guidance for PBKDF2-SHA-256
const DERIVED_KEY_BITS = 256; // 32 bytes
const SALT_BYTES = 16; // 128-bit salt

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(view).toString("base64");
  }
  let binary = "";
  for (let i = 0; i < view.length; i++) binary += String.fromCharCode(view[i]);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore btoa may not exist in some runtimes but guarded above
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(b64, "base64"));
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore atob may not exist in some runtimes but guarded above
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  const ab = new ArrayBuffer(view.byteLength);
  new Uint8Array(ab).set(view);
  return ab;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function deriveBitsPBKDF2(
  password: string,
  salt: Uint8Array,
  iterations: number,
  bits: number,
): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(salt),
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    bits,
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(SALT_BYTES);
  crypto.getRandomValues(salt);
  const derived = await deriveBitsPBKDF2(
    password,
    salt,
    ITERATIONS,
    DERIVED_KEY_BITS,
  );
  const hashB64 = toBase64(derived);
  const saltB64 = toBase64(salt);
  return `pbkdf2:${ITERATIONS}:${saltB64}:${hashB64}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  try {
    const parts = stored.split(":");
    if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
    const iterations = Number.parseInt(parts[1], 10);
    if (!Number.isFinite(iterations) || iterations <= 0) return false;
    const salt = fromBase64(parts[2]);
    const expected = fromBase64(parts[3]);
    const derived = await deriveBitsPBKDF2(
      password,
      salt,
      iterations,
      expected.length * 8,
    );
    return constantTimeEqual(new Uint8Array(derived), expected);
  } catch {
    return false;
  }
}
