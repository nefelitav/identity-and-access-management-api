import redis from "~/utils/redis";
import crypto from "crypto";
import { sendEmail, sendSms } from "~/utils";

const CODE_TTL_SECONDS = 300; // 5 minutes

export async function generateAndSendCodeViaEmail(
  userId: string,
  email: string,
): Promise<void> {
  const code = await generateCode(userId);
  await sendEmail({
    to: email,
    subject: "Your MFA Code",
    text: `Your login code is: ${code}`,
  });
}

export async function generateAndSendCodeViaSms(
  userId: string,
  phone: string,
): Promise<void> {
  const code = await generateCode(userId);
  await sendSms({
    to: phone,
    text: `Your login code is: ${code}`,
  });
}

export async function generateCode(userId: string): Promise<string> {
  const code = crypto.randomInt(100000, 999999).toString();
  await redis.setEx(`mfa_code:${userId}`, CODE_TTL_SECONDS, code);
  return code;
}

export async function verifyCode(
  userId: string,
  inputCode: string,
): Promise<boolean> {
  const storedCode = await redis.get(`mfa_code:${userId}`);
  if (storedCode && storedCode === inputCode) {
    await redis.del(`mfa_code:${userId}`);
    return true;
  }
  return false;
}
