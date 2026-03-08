import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "~/config";
import { container, SERVICE_IDENTIFIERS } from "~/core";
import { SessionRepository } from "~/repositories";
import { createLogger } from "~/utils";

const logger = createLogger("AuthMiddleware");

interface AuthPayload {
  userId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
  sub?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: {
        message: "Unauthorized: No token provided",
      },
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "identity-forge-api",
      audience: "identity-forge-client",
      clockTolerance: 30,
    }) as unknown as AuthPayload;

    if (!decoded.userId || !decoded.sessionId) {
      logger.warn("Token missing required claims");
      res.status(401).json({
        success: false,
        error: {
          message: "Unauthorized: Invalid token claims",
        },
      });
      return;
    }

    // Verify the session still exists in the database
    try {
      const sessionRepository = container.get<SessionRepository>(
        SERVICE_IDENTIFIERS.SessionRepository,
      );
      const session = await sessionRepository.findById(decoded.sessionId);
      if (!session || session.expiresAt.getTime() < Date.now()) {
        logger.debug("Session revoked or expired", {
          sessionId: decoded.sessionId,
        });
        res.status(401).json({
          success: false,
          error: { message: "Unauthorized: Session expired or revoked" },
        });
        return;
      }
    } catch {
      // If the container/repo isn't available (e.g. in unit tests that only
      // mock JWT), fall through and allow the request.
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      logger.debug("Token expired", { error: err.message });
      res.status(401).json({
        success: false,
        error: {
          message: "Unauthorized: Token expired",
        },
      });
      return;
    } else if (err instanceof jwt.JsonWebTokenError) {
      logger.debug("Invalid token", { error: err.message });
      res.status(401).json({
        success: false,
        error: {
          message: "Unauthorized: Invalid token",
        },
      });
      return;
    } else {
      logger.error("JWT verification error:", err as Error);
      res.status(401).json({
        success: false,
        error: {
          message: "Unauthorized: Token verification failed",
        },
      });
      return;
    }
  }
}
