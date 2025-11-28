import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, ZodObject, ZodRawShape } from "zod";

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

export function validateRequest(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schema instanceof ZodObject) {
        const shape = schema.shape;
        const parsed: any = {};

        // Parse body if schema has body
        if (shape.body) {
          parsed.body = shape.body.parse(req.body);
          req.body = parsed.body;
        }

        // Parse query if schema has query
        if (shape.query) {
          parsed.query = shape.query.parse(req.query);
          req.query = parsed.query;
        }

        // Parse params if schema has params
        if (shape.params) {
          parsed.params = shape.params.parse(req.params);
          req.params = parsed.params;
        }
      } else {
        // Legacy format with explicit body/query/params
        if (schema.body) {
          req.body = schema.body.parse(req.body);
        }
        if (schema.query) {
          req.query = schema.query.parse(req.query);
        }
        if (schema.params) {
          req.params = schema.params.parse(req.params);
        }
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            message: "Validation Error",
            details: error.errors,
          },
        });
      }
      next(error);
    }
  };
}
