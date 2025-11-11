import { z } from "zod";

// Common validation schemas
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

// Auth validation schemas
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

export const logoutSchema = z.object({
  body: z.object({}), // Empty body for logout
});

// User validation schemas
export const updateProfileSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
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

// Session validation schemas
export const getSessionsSchema = z.object({
  query: paginationSchema,
});

export const deleteSessionSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

// MFA validation schemas
export const totpSetupSchema = z.object({
  body: z.object({
    password: z.string().min(1, "Password is required"),
  }),
});

export const totpVerifySchema = z.object({
  body: z.object({
    token: z.string().length(6, "TOTP token must be 6 digits"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const otpRequestSchema = z.object({
  body: z.object({
    phoneNumber: z
      .string()
      .regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number format"),
  }),
});

export const otpVerifySchema = z.object({
  body: z.object({
    phoneNumber: z
      .string()
      .regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number format"),
    code: z.string().length(6, "OTP code must be 6 digits"),
  }),
});

// RBAC validation schemas
export const createRoleSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Role name is required")
      .max(50, "Role name too long"),
    permissions: z.array(uuidSchema).optional(),
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    name: z
      .string()
      .min(1, "Role name is required")
      .max(50, "Role name too long")
      .optional(),
    permissions: z.array(uuidSchema).optional(),
  }),
});

export const assignRoleSchema = z.object({
  params: z.object({
    userId: uuidSchema,
    roleId: uuidSchema,
  }),
});

export const createPermissionSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Permission name is required")
      .max(50, "Permission name too long"),
  }),
});

// Admin validation schemas
export const adminUpdateProfileSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
  }),
});

export const adminGetUsersSchema = z.object({
  query: paginationSchema.extend({
    search: z.string().optional(),
    role: z.string().optional(),
    sortBy: z.enum(["email", "createdAt", "updatedAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});
