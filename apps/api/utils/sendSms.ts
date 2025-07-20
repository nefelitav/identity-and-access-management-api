import twilio from "twilio";

export async function sendSms({ to, text }: { to: string; text?: string }) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  try {
    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
      body: text,
    });
  } catch (err) {
    console.error("Error sending SMS:", err);
    throw new Error("Failed to send SMS");
  }
}
