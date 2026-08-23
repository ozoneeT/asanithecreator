// Server-only Cloudflare R2 client.
//
// SECURITY: reads R2_SECRET_ACCESS_KEY and must never reach the browser bundle.
// Imported only by api/* and the dev middleware in vite.config.ts.
//
// R2 is plain object storage, so the library index lives in the bucket itself as
// manifest.json. The portfolio reads that file straight from the CDN — no
// serverless call on the read path — and only writes go through /api/*.

import crypto from 'node:crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { ManifestEntry, VideoManifest } from './videoTypes';

export const MANIFEST_KEY = 'manifest.json';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicHost: string;
}

/** Returns null when R2 isn't configured yet, so callers can fall back. */
export function readConfig(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicHost = process.env.R2_PUBLIC_HOST;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicHost) return null;
  return {
    accountId, accessKeyId, secretAccessKey, bucket,
    publicHost: publicHost.replace(/^https?:\/\//, '').replace(/\/+$/, ''),
  };
}

/** Constant-time compare so the studio password can't be guessed by timing. */
export function checkStudioPassword(supplied: string | undefined): boolean {
  const expected = process.env.STUDIO_PASSWORD;
  if (!expected || !supplied) return false;      // unset = locked, never open
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function client(cfg: R2Config): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
    // The SDK's default CRC32 checksum header is not part of the presigned
    // signature R2 validates, which makes presigned PUTs fail. Only send
    // checksums where the operation actually requires them.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
}

// ── Manifest ────────────────────────────────────────────────

export async function readManifest(cfg: R2Config): Promise<VideoManifest> {
  try {
    const res = await client(cfg).send(new GetObjectCommand({ Bucket: cfg.bucket, Key: MANIFEST_KEY }));
    const text = await res.Body?.transformToString();
    if (!text) return { version: 1, videos: [] };
    const parsed = JSON.parse(text) as VideoManifest;
    return { version: 1, videos: Array.isArray(parsed.videos) ? parsed.videos : [] };
  } catch (err) {
    // A bucket with no manifest yet is the normal first-run state.
    const name = (err as { name?: string }).name;
    if (name === 'NoSuchKey' || name === 'NotFound') return { version: 1, videos: [] };
    throw err;
  }
}

export async function writeManifest(cfg: R2Config, manifest: VideoManifest): Promise<void> {
  await client(cfg).send(new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: MANIFEST_KEY,
    Body: JSON.stringify(manifest),
    ContentType: 'application/json',
    // Short TTL: a new upload shows up within a minute, but repeat visitors
    // still hit the edge cache rather than origin.
    CacheControl: 'public, max-age=60',
  }));
}

// ── Uploads ─────────────────────────────────────────────────

/** Presigned PUT so the browser uploads straight to R2, key never leaving the server. */
export async function presignPut(cfg: R2Config, key: string, contentType: string): Promise<string> {
  return getSignedUrl(
    client(cfg),
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      ContentType: contentType,
      // Media is immutable once written — each upload gets a fresh id.
      CacheControl: 'public, max-age=31536000, immutable',
    }),
    { expiresIn: 3600 },
  );
}

export async function deleteKeys(cfg: R2Config, keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await client(cfg).send(new DeleteObjectsCommand({
    Bucket: cfg.bucket,
    Delete: { Objects: keys.map(Key => ({ Key })) },
  }));
}

export function newVideoId(): string {
  return crypto.randomBytes(8).toString('hex');
}

export type { ManifestEntry, VideoManifest };
