import { config } from "~/config";
import { Secret } from "jsonwebtoken";

export const JWT_SECRET: Secret = config.JWT_SECRET;
export const JWT_EXPIRY = config.JWT_EXPIRY;
export const SALT = 10;
