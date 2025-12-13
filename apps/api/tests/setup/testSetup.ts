import dotenv from "dotenv";
dotenv.config({ path: "./.env.dev" });
import { prisma, PrismaClientType } from "@repo/prisma/index";
import {
  container,
  SERVICE_IDENTIFIERS,
  InMemoryEventBus,
  InMemoryEventStore,
} from "~/core";
import {
  UserRepository,
  RbacRepository,
  PermissionsRepository,
  SessionRepository,
  TotpRepository,
} from "~/repositories";
import { createLogger } from "~/utils";
import { InMemoryCacheStrategy, CacheService } from "~/services";

export class MockEmailService {
  sentEmails: Array<{ to: string; subject: string; type: string }> = [];

  async sendWelcomeEmail(email: string): Promise<void> {
    this.sentEmails.push({ to: email, subject: "Welcome", type: "welcome" });
  }

  async sendSecurityAlert(userId: string): Promise<void> {
    this.sentEmails.push({
      to: userId,
      subject: "Security Alert",
      type: "security",
    });
  }

  async sendAccountLockedNotification(userId: string): Promise<void> {
    this.sentEmails.push({
      to: userId,
      subject: "Account Locked",
      type: "locked",
    });
  }

  async sendPasswordChangedNotification(email: string): Promise<void> {
    this.sentEmails.push({
      to: email,
      subject: "Password Changed",
      type: "password-changed",
    });
  }

  async sendEmailChangedNotification(newEmail: string): Promise<void> {
    this.sentEmails.push({
      to: newEmail,
      subject: "Email Changed",
      type: "email-changed",
    });
  }

  clear(): void {
    this.sentEmails = [];
  }
}

export class MockSmsService {
  sentSms: Array<{ to: string; message: string }> = [];

  async sendMfaEnabledNotification(
    userId: string,
    mfaType: "TOTP" | "OTP",
  ): Promise<void> {
    this.sentSms.push({
      to: userId,
      message: `MFA ${mfaType} enabled`,
    });
  }

  async sendMfaDisabledNotification(
    userId: string,
    mfaType: "TOTP" | "OTP",
  ): Promise<void> {
    this.sentSms.push({
      to: userId,
      message: `MFA ${mfaType} disabled`,
    });
  }

  async sendOtpCode(phoneNumber: string, code: string): Promise<void> {
    this.sentSms.push({ to: phoneNumber, message: code });
  }

  clear(): void {
    this.sentSms = [];
  }
}

export class MockCaptchaService {
  verifyResults: Map<string, boolean> = new Map();

  async verifyCaptcha(
    token: string,
  ): Promise<{ success: boolean; score?: number }> {
    const result = this.verifyResults.get(token) ?? true;
    return { success: result, score: result ? 0.9 : 0.1 };
  }

  async verifyCaptchaV2(token: string): Promise<boolean> {
    return this.verifyResults.get(token) ?? true;
  }

  async verifyCaptchaV3(
    token: string,
    minScore: number = 0.5,
  ): Promise<boolean> {
    const result = this.verifyResults.get(token) ?? true;
    return result && (this.verifyResults.get(token) ? 0.9 : 0.1) >= minScore;
  }

  static async verify(
    token: string,
  ): Promise<{ success: boolean; score?: number }> {
    const instance = new MockCaptchaService();
    return instance.verifyCaptcha(token);
  }

  setVerifyResult(token: string, success: boolean): void {
    this.verifyResults.set(token, success);
  }

  clear(): void {
    this.verifyResults.clear();
  }
}

export class TestContainer {
  private prisma: PrismaClientType;
  private mockEmailService: MockEmailService;
  private mockSmsService: MockSmsService;
  private mockCaptchaService: MockCaptchaService;

  constructor() {
    this.prisma = prisma;

    this.mockEmailService = new MockEmailService();
    this.mockSmsService = new MockSmsService();
    this.mockCaptchaService = new MockCaptchaService();
  }

  async setup(): Promise<void> {
    container.bind(SERVICE_IDENTIFIERS.DatabaseClient, this.prisma);
    container.bind(SERVICE_IDENTIFIERS.Logger, createLogger("Test"));
    container.bind(SERVICE_IDENTIFIERS.EventBus, new InMemoryEventBus());
    container.bind(SERVICE_IDENTIFIERS.EventStore, new InMemoryEventStore());
    container.bind(SERVICE_IDENTIFIERS.EmailService, this.mockEmailService);
    container.bind(SERVICE_IDENTIFIERS.SmsService, this.mockSmsService);
    container.bind(SERVICE_IDENTIFIERS.CaptchaService, this.mockCaptchaService);

    container.bindFactory(SERVICE_IDENTIFIERS.UserRepository, () => {
      return new UserRepository(this.prisma);
    });

    container.bindFactory(SERVICE_IDENTIFIERS.RbacRepository, () => {
      return new RbacRepository(this.prisma);
    });

    container.bindFactory(SERVICE_IDENTIFIERS.PermissionRepository, () => {
      return new PermissionsRepository(this.prisma);
    });

    container.bindFactory(SERVICE_IDENTIFIERS.SessionRepository, () => {
      return new SessionRepository(this.prisma);
    });

    container.bindFactory(SERVICE_IDENTIFIERS.TotpRepository, () => {
      return new TotpRepository(this.prisma);
    });

    const mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      setEx: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      flushdb: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
    };
    container.bind(SERVICE_IDENTIFIERS.RedisClient, mockRedis);

    // Mock Cache Service
    const cacheStrategy = new InMemoryCacheStrategy();
    const logger = container.get(SERVICE_IDENTIFIERS.Logger);
    container.bind(
      SERVICE_IDENTIFIERS.CacheService,
      new CacheService(cacheStrategy, logger),
    );
  }

  async cleanup(): Promise<void> {
    // Clean up database
    await this.prisma.userRole.deleteMany();
    await this.prisma.rolePermission.deleteMany();
    await this.prisma.session.deleteMany();
    await this.prisma.mfaSecret.deleteMany();
    await this.prisma.user.deleteMany();
    await this.prisma.role.deleteMany();
    await this.prisma.permission.deleteMany();

    // Clear mocks
    this.mockEmailService.clear();
    this.mockSmsService.clear();
    this.mockCaptchaService.clear();
  }

  async teardown(): Promise<void> {
    await this.cleanup();
    await this.prisma.$disconnect();
  }

  getMockEmailService(): MockEmailService {
    return this.mockEmailService;
  }

  getMockSmsService(): MockSmsService {
    return this.mockSmsService;
  }

  getMockCaptchaService(): MockCaptchaService {
    return this.mockCaptchaService;
  }

  getPrisma(): PrismaClientType {
    return this.prisma;
  }
}

export const testContainer = new TestContainer();
