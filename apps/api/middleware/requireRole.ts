import { Request, Response, NextFunction } from "express";
import { container, SERVICE_IDENTIFIERS } from "~/core";
import { RbacRepository } from "~/repositories";
import createLogger from "~/utils/createLogger";

const logger = createLogger("RequireRole");

/**
 * Middleware factory that checks whether the authenticated user has at least
 * one of the required roles. Must be placed AFTER `authMiddleware`.
 *
 * Usage: `router.use(authMiddleware, requireRole("admin"))`
 */
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
      const rbacRepository = container.get<RbacRepository>(
        SERVICE_IDENTIFIERS.RbacRepository,
      );
      const userRoles = await rbacRepository.getUserRoles(userId);
      const roleNames = userRoles.map((ur: any) => ur.role.name);

      if (!roles.some((r) => roleNames.includes(r))) {
        logger.warn(
          `User ${userId} denied — requires [${roles.join(", ")}], has [${roleNames.join(", ")}]`,
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
