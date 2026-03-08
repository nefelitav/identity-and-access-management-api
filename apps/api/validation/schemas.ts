import { z } from "zod";

export const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(1, "Email is required")
  .max(255, "Email too long");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  );

export const uuidSchema = z.string().uuid("Invalid ID format");

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, "Page must be greater than 0"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
});

export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
    remember: z.boolean().optional(),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const getUsersSchema = z.object({
  query: paginationSchema.extend({
    search: z.string().optional(),
    sortBy: z.enum(["email", "createdAt", "updatedAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const adminUpdateProfileSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
  }),
});
