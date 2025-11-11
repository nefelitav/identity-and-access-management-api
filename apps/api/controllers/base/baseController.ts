import { Request, Response } from "express";
import { AppError } from "~/middleware";
import { createLogger, ResponseCode } from "~/utils";

const logger = createLogger("BaseController");

export abstract class BaseController {
  protected static async handleRequest<T>(
    req: Request,
    res: Response,
    handler: () => Promise<T | void>,
    successCode: number = ResponseCode.OK,
  ): Promise<void> {
    try {
      const result = await handler();

      // If the handler returns data (non-null, non-undefined)
      if (result !== undefined && result !== null) {
        res.status(successCode).json({
          success: true,
          data: result,
        });
      } else {
        // For void-returning handlers
        res.sendStatus(successCode);
      }
    } catch (error) {
      logger.error(
        `Request failed for ${req.method} ${req.path}`,
        error as Error,
      );

      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: { message: error.message },
        });
      } else {
        res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: { message: "Internal server error" },
        });
      }
    }
  }

  protected static extractUserAgent(req: Request): string | undefined {
    return req.headers["user-agent"];
  }

  protected static extractIpAddress(req: Request): string | undefined {
    return req.ip;
  }
}
