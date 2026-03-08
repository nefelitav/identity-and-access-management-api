import { Request, Response, NextFunction } from "express";
import { ResponseCode } from "~/utils";

export type AppRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * Wraps an async handler so it catches errors and forwards them to the
 * Express error-handling middleware instead of swallowing them.
 */
export function handleRequest(
  handler: (req: Request) => Promise<unknown>,
  successCode: number = ResponseCode.OK,
): AppRequestHandler {
  return async (req, res, next) => {
    try {
      const result = await handler(req);

      if (result !== undefined && result !== null) {
        res.status(successCode).json({
          success: true,
          data: result,
        });
      } else {
        res.status(successCode).json({ success: true, data: null });
      }
    } catch (error) {
      next(error); // let the centralised error handler deal with it
    }
  };
}

export function extractUserAgent(req: Request): string | undefined {
  return req.headers["user-agent"];
}

export function extractIpAddress(req: Request): string | undefined {
  return req.ip;
}
