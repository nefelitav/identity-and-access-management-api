export * from "./totpService";
export {
  generateCode,
  generateAndSendCodeViaEmail,
  generateAndSendCodeViaSms,
  verifyCode as verifyOtpCode,
} from "./otpService";
