import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { JWT_EXPIRY, JWT_SECRET } from "~/utils/constants";
import { SessionService } from "~/services";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "~/utils/sendEmail";

const prisma = new PrismaClient();

export async function generateTokens(
  userId: string,
  userAgent?: string,
  ip?: string,
) {
  const knownSession = await prisma.session.findFirst({
    where: { userId, userAgent, ipAddress: ip },
  });

  if (!knownSession) {
    await sendEmail({
      to: (await prisma.user.findUnique({ where: { id: userId } }))!.email,
      subject: "Security Alert: New Login Detected",
      text: `Hi,
      We detected a login to your account from a new device or location.
      
      Details:
      IP Address: ${ip}
      Device/Browser: ${userAgent}
      
      If this was you, no action is needed.
      If you did NOT authorize this login, please reset your password immediately and review your account's active sessions.
      
      Stay safe,
      Auth Forge Security Team`,
      html: `<p>Hi,</p>
      <p>We detected a login to your account from a new device or location.</p>
      <p><strong>Details:</strong><br>
      IP Address: ${ip}<br>
      Device/Browser: ${userAgent}</p>
      <p>If this was you, no action is needed.<br>
      If you did NOT authorize this login, please <a href="https://yourapp.com/reset-password">reset your password</a> immediately and review your account's active sessions.</p>
      <p>Stay safe,<br>Auth Forge Security Team</p>`,
    });
  }

  const refreshToken = uuidv4();
  const accessToken = jwt.sign(
    { userId, sessionId: refreshToken },
    JWT_SECRET!,
    {
      expiresIn: JWT_EXPIRY,
    },
  );

  await SessionService.createSession(userId, refreshToken, userAgent, ip);

  return { accessToken, refreshToken };
}
