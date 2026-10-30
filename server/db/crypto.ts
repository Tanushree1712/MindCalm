import crypto from 'crypto';

// Master key derived from environment or secure consistent local secret for database encryption
const configuredSecret = process.env.DB_ENCRYPTION_SECRET;
if (process.env.VERCEL && !configuredSecret) {
  throw new Error('DB_ENCRYPTION_SECRET must be configured for Vercel deployments');
}
const ENCRYPTION_SECRET = configuredSecret || 'mindcalm-local-development-key-only';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const KEY = crypto.createHash('sha256').update(String(ENCRYPTION_SECRET)).digest();

export interface EncryptedData {
  iv: string;
  tag: string;
  data: string;
}

/**
 * Encrypts any serializable object or string with AES-256-GCM
 */
export function encryptPayload(data: unknown): EncryptedData {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    tag,
    data: encrypted
  };
}

/**
 * Decrypts AES-256-GCM payload and returns parsed object or original string
 */
export function decryptPayload<T = unknown>(encrypted: EncryptedData): T {
  try {
    const iv = Buffer.from(encrypted.iv, 'hex');
    const tag = Buffer.from(encrypted.tag, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    try {
      return JSON.parse(decrypted) as T;
    } catch {
      return decrypted as unknown as T;
    }
  } catch (err) {
    console.error('Decryption failed for secure document:', err);
    throw new Error('Failed to decrypt database record');
  }
}
