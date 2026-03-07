import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import redis from "~/utils/redis";
import { TotpRepository } from "~/repositories";
import { container, SERVICE_IDENTIFIERS } from "~/core";

const VERIFICATION_CODE_TTL = 300; // 5 minutes
const MAX_ATTEMPTS = 5;

function getTotpRepository() {
  return container.get<TotpRepository>(SERVICE_IDENTIFIERS.TotpRepository);
}

/** Generate a TOTP secret and QR code for initial setup. */
export async function generateSecret(userId: string) {
  const repo = getTotpRepository();
  const secret = speakeasy.generateSecret({ name: `YourApp (${userId})` });

  await repo.createOrUpdateSecret(userId, secret.base32, false);

  const qrCode = await qrcode.toDataURL(secret.otpauth_url!);
  return { secret: secret.base32, qrCode };
}

/** Confirm the token and permanently enable TOTP MFA. */
export async function confirmAndEnable(
  userId: string,
  token: string,
): Promise<boolean> {
  const repo = getTotpRepository();
  const secretEntry = await repo.getSecretByUserId(userId);
  if (!secretEntry) return false;

  const isValid = speakeasy.totp.verify({
    secret: secretEntry.secret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (isValid) {
    await repo.enableMfa(userId);
  }

  return isValid;
}

/** Verify a TOTP token against the stored secret. */
export async function verifyCode(
  userId: string,
  token: string,
): Promise<boolean> {
  const repo = getTotpRepository();
  const attemptsKey = `mfa_attempts:${userId}`;
  const mfaSecret = await repo.getSecretByUserId(userId);
  if (!mfaSecret || !mfaSecret.enabled) return false;

  const attempts = Number(await redis.get(attemptsKey)) || 0;
  if (attempts >= MAX_ATTEMPTS) return false;

  const isValid = speakeasy.totp.verify({
    secret: mfaSecret.secret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (isValid) {
    await redis.del(attemptsKey);
    return true;
  } else {
    await redis.setEx(
      attemptsKey,
      VERIFICATION_CODE_TTL,
      (attempts + 1).toString(),
    );
    return false;
  }
}

/** Disable TOTP MFA for a user. */
export async function disable(userId: string) {
  const repo = getTotpRepository();
  await repo.disableMfa(userId);
}
