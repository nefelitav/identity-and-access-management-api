import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import redis from "~/utils/redis";
import { TotpRepository } from "~/repositories";
import { container, SERVICE_IDENTIFIERS } from "~/core";

const VERIFICATION_CODE_TTL = 300; // 5 minutes
const MAX_ATTEMPTS = 5;

export class TotpService {
  private static get permissionsRepo() {
    return container.get<TotpRepository>(SERVICE_IDENTIFIERS.TotpRepository);
  }
  static async generateSecret(userId: string) {
    const secret = speakeasy.generateSecret({ name: `YourApp (${userId})` });

    await this.permissionsRepo.createOrUpdateSecret(
      userId,
      secret.base32,
      false,
    );

    const qrCode = await qrcode.toDataURL(secret.otpauth_url!);

    return { secret: secret.base32, qrCode };
  }

  static async confirmAndEnable(
    userId: string,
    token: string,
  ): Promise<boolean> {
    const secretEntry = await this.permissionsRepo.getSecretByUserId(userId);
    if (!secretEntry) return false;

    const isValid = speakeasy.totp.verify({
      secret: secretEntry.secret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (isValid) {
      await this.permissionsRepo.enableMfa(userId);
    }

    return isValid;
  }

  static async verifyCode(userId: string, token: string): Promise<boolean> {
    const attemptsKey = `mfa_attempts:${userId}`;
    const mfaSecret = await this.permissionsRepo.getSecretByUserId(userId);
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

  static async disable(userId: string) {
    await this.permissionsRepo.disableMfa(userId);
  }
}
