import { createLogger } from "~/utils";
import { config } from "~/config";

const logger = createLogger("SmsService");

export interface SmsData {
  to: string;
  message: string;
}

export class SmsService {
  async sendMfaEnabledNotification(
    _userId: string,
    mfaType: "TOTP" | "OTP",
  ): Promise<void> {
    const message = `MFA ${mfaType} has been enabled for your Identity Forge account. If you did not enable this, please contact support immediately.`;

    // Get user phone number from userId (would need user repository)
    const phoneNumber = "+1234567890"; // This should be fetched from user repository

    await this.sendSms({
      to: phoneNumber,
      message,
    });
  }

  async sendMfaDisabledNotification(
    _userId: string,
    mfaType: "TOTP" | "OTP",
  ): Promise<void> {
    const message = `MFA ${mfaType} has been disabled for your Identity Forge account. If you did not disable this, please contact support immediately.`;

    const phoneNumber = "+1234567890"; // This should be fetched from user repository

    await this.sendSms({
      to: phoneNumber,
      message,
    });
  }

  async sendOtpCode(phoneNumber: string, code: string): Promise<void> {
    const message = `Your Identity Forge verification code is: ${code}. This code expires in 5 minutes.`;

    await this.sendSms({
      to: phoneNumber,
      message,
    });
  }

  private async sendSms(data: SmsData): Promise<void> {
    try {
      const twilio = require("twilio");
      const client = twilio(
        config.TWILIO_ACCOUNT_SID,
        config.TWILIO_AUTH_TOKEN,
      );

      await client.messages.create({
        body: data.message,
        from: config.TWILIO_PHONE_NUMBER,
        to: data.to,
      });

      logger?.info(`SMS sent successfully to ${data.to}`);
    } catch (error) {
      logger?.error(`Failed to send SMS to ${data.to}:` + error);
      throw error;
    }
  }
}
