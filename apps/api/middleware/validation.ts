import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodObject, ZodRawShape } from "zod";

type ValidationSchema =
  | {
      body?: ZodSchema;
      query?: ZodSchema;
      params?: ZodSchema;
    }
  | ZodObject<{
      body?: ZodObject<ZodRawShape>;
      query?: ZodObject<ZodRawShape>;
      params?: ZodObject<ZodRawShape>;
    }>;

/**
 * Safely assign parsed values to a potentially read-only Express property.
 * Express 5 makes req.query a getter, so direct assignment throws.
 */
function safeAssign(
  req: Request,
  key: "body" | "query" | "params",
  value: any,
) {
  try {
    (req as any)[key] = value;
  } catch {
    // Express 5: req.query / req.params may be getter-only — merge in place
    const target = (req as any)[key];
    if (target && typeof target === "object") {
      // Clear existing keys then copy parsed values
      for (const k of Object.keys(target)) delete target[k];
      Object.assign(target, value);
    }
  }
}

export function validateRequest(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schema instanceof ZodObject) {
        const shape = schema.shape;

        if (shape.body) {
          safeAssign(req, "body", shape.body.parse(req.body));
        }

        if (shape.query) {
          safeAssign(req, "query", shape.query.parse(req.query));
        }

        if (shape.params) {
          safeAssign(req, "params", shape.params.parse(req.params));
        }
      } else {
        if (schema.body) {
          safeAssign(req, "body", schema.body.parse(req.body));
        }
        if (schema.query) {
          safeAssign(req, "query", schema.query.parse(req.query));
        }
        if (schema.params) {
          safeAssign(req, "params", schema.params.parse(req.params));
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
