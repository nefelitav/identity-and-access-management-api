import swaggerJsdoc from "swagger-jsdoc";
import { config } from "~/config";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Identity Forge API",
      version: "1.0.0",
      description:
        "A comprehensive identity and access management API with authentication, authorization, MFA, and session management.",
      contact: {
        name: "API Support",
        email: "support@identityforge.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: "Development server",
      },
      {
        url: "https://api.identityforge.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from login endpoint",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Error message",
                },
                code: {
                  type: "number",
                  example: 400,
                },
              },
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
            path: {
              type: "string",
              example: "/v1/auth/login",
            },
            method: {
              type: "string",
              example: "POST",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              description: "Response data",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              minLength: 8,
              example: "SecurePassword123!",
            },
            remember: {
              type: "boolean",
              example: false,
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              minLength: 8,
              example: "SecurePassword123!",
            },
          },
        },
        RegisterResponse: {
          allOf: [
            { $ref: "#/components/schemas/User" },
            { $ref: "#/components/schemas/LoginResponse" },
          ],
        },
        PaginationMeta: {
          type: "object",
          properties: {
            page: {
              type: "number",
              example: 1,
            },
            limit: {
              type: "number",
              example: 10,
            },
            total: {
              type: "number",
              example: 100,
            },
            totalPages: {
              type: "number",
              example: 10,
            },
            hasNext: {
              type: "boolean",
              example: true,
            },
            hasPrev: {
              type: "boolean",
              example: false,
            },
          },
        },
        PaginatedUsers: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/User" },
            },
            pagination: {
              $ref: "#/components/schemas/PaginationMeta",
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Authentication information is missing or invalid",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        ValidationError: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        InternalServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./apps/api/routes/**/*.ts", "./apps/api/controllers/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
