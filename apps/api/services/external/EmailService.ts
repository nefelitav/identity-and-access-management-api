import { createLogger } from "~/utils";
import { config } from "~/config";

const logger = createLogger("EmailService");

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  constructor(private logger?: any) {}

  async sendWelcomeEmail(email: string): Promise<void> {
    const template = this.getWelcomeEmailTemplate();
    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendSecurityAlert(
    userId: string,
    data: { userAgent?: string; ipAddress?: string; timestamp: Date },
  ): Promise<void> {
    const template = this.getSecurityAlertTemplate(data);
    // todo: bring from repository
    const userEmail = userId + "@gmail.com";

    await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendAccountLockedNotification(
    userId: string,
    lockoutUntil: Date,
  ): Promise<void> {
    const template = this.getAccountLockedTemplate(lockoutUntil);
    // todo: bring from repository
    const userEmail = userId + "@gmail.com";

    await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendPasswordChangedNotification(email: string): Promise<void> {
    const template = this.getPasswordChangedTemplate();

    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendEmailChangedNotification(
    oldEmail: string,
    newEmail: string,
  ): Promise<void> {
    const template = this.getEmailChangedTemplate(oldEmail, newEmail);

    await this.sendEmail({
      to: newEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  private async sendEmail(data: EmailData): Promise<void> {
    try {
      // Use nodemailer or your preferred email service
      const nodemailer = require("nodemailer");

      const transporter = nodemailer.createTransporter({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_PORT === 465,
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: config.SMTP_FROM,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
      });

      if (this.logger) {
        this.logger.info(`Email sent successfully to ${data.to}`);
      } else {
        logger.info(`Email sent successfully to ${data.to}`);
      }
    } catch (error) {
      if (this.logger) {
        this.logger.error(
          `Failed to send email to ${data.to}:`,
          error as Error,
        );
      } else {
        logger.error(`Failed to send email to ${data.to}:`, error as Error);
      }
      throw error;
    }
  }

  private getWelcomeEmailTemplate(): EmailTemplate {
    return {
      subject: "Welcome to Identity Forge!",
      html: `
        <h1>Welcome to Identity Forge!</h1>
        <p>Thank you for registering with us. Your account has been successfully created.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The Identity Forge Team</p>
      `,
      text: `
        Welcome to Identity Forge!
        
        Thank you for registering with us. Your account has been successfully created.
        
        If you have any questions, please don't hesitate to contact our support team.
        
        Best regards,
        The Identity Forge Team
      `,
    };
  }

  private getSecurityAlertTemplate(data: {
    userAgent?: string;
    ipAddress?: string;
    timestamp: Date;
  }): EmailTemplate {
    return {
      subject: "Security Alert: New Login Detected",
      html: `
        <h1>Security Alert</h1>
        <p>We detected a login to your account from a new device or location.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>IP Address: ${data.ipAddress || "Unknown"}</li>
          <li>Device/Browser: ${data.userAgent || "Unknown"}</li>
          <li>Time: ${data.timestamp.toISOString()}</li>
        </ul>
        <p>If this was you, no action is needed.</p>
        <p>If you did NOT authorize this login, please reset your password immediately.</p>
      `,
      text: `
        Security Alert
        
        We detected a login to your account from a new device or location.
        
        Details:
        - IP Address: ${data.ipAddress || "Unknown"}
        - Device/Browser: ${data.userAgent || "Unknown"}
        - Time: ${data.timestamp.toISOString()}
        
        If this was you, no action is needed.
        If you did NOT authorize this login, please reset your password immediately.
      `,
    };
  }

  private getAccountLockedTemplate(lockoutUntil: Date): EmailTemplate {
    return {
      subject: "Account Temporarily Locked",
      html: `
        <h1>Account Temporarily Locked</h1>
        <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
        <p>Lockout expires: ${lockoutUntil.toISOString()}</p>
        <p>Please wait until the lockout period expires before attempting to log in again.</p>
      `,
      text: `
        Account Temporarily Locked
        
        Your account has been temporarily locked due to multiple failed login attempts.
        
        Lockout expires: ${lockoutUntil.toISOString()}
        
        Please wait until the lockout period expires before attempting to log in again.
      `,
    };
  }

  private getPasswordChangedTemplate(): EmailTemplate {
    return {
      subject: "Password Changed Successfully",
      html: `
        <h1>Password Changed</h1>
        <p>Your password has been successfully changed.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
      `,
      text: `
        Password Changed
        
        Your password has been successfully changed.
        
        If you did not make this change, please contact our support team immediately.
      `,
    };
  }

  private getEmailChangedTemplate(
    oldEmail: string,
    newEmail: string,
  ): EmailTemplate {
    return {
      subject: "Email Address Changed",
      html: `
        <h1>Email Address Changed</h1>
        <p>Your email address has been changed from ${oldEmail} to ${newEmail}.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
      `,
      text: `
        Email Address Changed
        
        Your email address has been changed from ${oldEmail} to ${newEmail}.
        
        If you did not make this change, please contact our support team immediately.
      `,
    };
  }
}
