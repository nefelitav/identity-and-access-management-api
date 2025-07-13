export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRY = '15m';
export const REFRESH_EXPIRY = 60 * 60 * 24 * 7; // 7 days
export const SALT = 10;
export const CAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY!;
