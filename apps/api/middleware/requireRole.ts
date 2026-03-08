import { Request, Response, NextFunction } from "express";
import * as rbacService from "~/services/rbac/rbacService";
import createLogger from "~/utils/createLogger";

const logger = createLogger("RequireRole");

export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: "AUTH_UNAUTHORIZED", message: "Unauthorized" },
      });
      return;
    }

    try {
      const userRoles = await rbacService.getUserRoles(userId);

      if (!roles.some((r) => userRoles.includes(r))) {
        logger.warn(
          `User ${userId} denied — requires [${roles.join(", ")}], has [${userRoles.join(", ")}]`,
        );
        res.status(403).json({
          success: false,
          error: {
            code: "AUTH_FORBIDDEN",
            message: "Forbidden: insufficient permissions",
          },
        });
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
