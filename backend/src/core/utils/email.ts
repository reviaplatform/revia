import Config from '@/config/env';
import { log } from '@/log';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

// Interface defining the email services
interface IEmailServices {
  sendOTP(recipientEmail: string, otp: string): Promise<boolean>;
  sendDeviceReadyForPickup(recipientEmail: string, deviceName: string): Promise<boolean>;
  sendStatusUpdate(recipientEmail: string, deviceName: string, statusLabel: string): Promise<boolean>;
  sendCareCheckIn(recipientEmail: string, deviceName: string): Promise<boolean>;
}

// Base email template with revia branding
const getBaseEmailTemplate = (content: string, title: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #374151;
          background-color: #f3f4f6;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          padding: 40px 20px;
          background-color: #f3f4f6;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .content {
          padding: 40px 40px;
          background-color: #ffffff;
        }
        .content h2 {
          color: #111827;
          font-size: 24px;
          margin: 0 0 24px 0;
          font-weight: 600;
          letter-spacing: -0.5px;
        }
        .content p {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 20px;
        }
        .otp-box {
          background-color: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 30px;
          margin: 30px 0;
          text-align: center;
        }
        .otp-code {
          color: #1e40af;
          font-size: 42px;
          font-weight: 700;
          letter-spacing: 8px;
          margin: 0;
          font-family: 'Courier New', Courier, monospace;
        }
        .features-list {
          background-color: #eff6ff;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        .features-list p {
          margin-top: 0;
          color: #1e3a8a;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .features-list ul {
          margin: 0;
          padding-left: 20px;
          color: #3b82f6;
        }
        .features-list li {
          margin-bottom: 8px;
          font-size: 15px;
          color: #1e3a8a;
        }
        .features-list li:last-child {
          margin-bottom: 0;
        }
        .footer {
          background-color: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 30px 40px;
          text-align: center;
        }
        .footer p {
          margin: 8px 0;
          font-size: 14px;
          color: #64748b;
        }
        .footer strong {
          color: #334155;
        }
        .social-links {
          margin-top: 16px;
        }
        .social-links a {
          color: #3b82f6;
          text-decoration: none;
          margin: 0 8px;
          font-weight: 500;
        }
        @media (max-width: 600px) {
          .wrapper {
            padding: 20px 10px;
          }
          .content {
            padding: 30px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="email-container">
          <div class="header">
            <h1>✨ Revia</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p><strong>Revia</strong></p>
            <p>Thank you for choosing Revia.</p>
            <div class="social-links">
              <a href="https://www.reviaplatform.me">Visit Website</a> | 
              <a href="mailto:support@reviaplatform.me">Contact Support</a>
            </div>
            <p style="margin-top: 16px; font-size: 12px;">© ${new Date().getFullYear()} Revia. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Class implementing the email services
class EmailServices implements IEmailServices {
  private transporter: Transporter;

  // Constructor to initialize the email transporter
  constructor(
    private senderName: string,
    private email: string,
    private pass: string,
  ) {
    // Create a transporter object using the default SMTP transport
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.email, // email user
        pass: this.pass, // email password
      },
    });
  }

  // Private method to send an email
  private async sendMail(content: Omit<SendMailOptions, 'from'>): Promise<void> {
    await this.transporter.sendMail({
      from: `"${this.senderName}" <${this.email}>`, // sender address
      ...content,
    });
  }

  // Public method to send an OTP email
  public async sendOTP(recipientEmail: string, otp: string): Promise<boolean> {
    try {
      const content = `
        <h2>Account Verification</h2>
        <p>Hello! We received a request to verify your Revia account. Please use the verification code below to securely complete the process:</p>
        
        <div class="otp-box">
          <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Verification Code</p>
          <div class="otp-code">${otp}</div>
        </div>
        
        <div class="features-list">
          <p>Security Notice:</p>
          <ul>
            <li>This code will expire in 15 minutes.</li>
            <li>Do not share this code with anyone.</li>
            <li>If you didn't request this code, please secure your account immediately.</li>
          </ul>
        </div>
        
        <p style="margin-top: 24px;">If you have any questions or need assistance, feel free to reply to this email or contact our support team.</p>
      `;

      const mailOptions: SendMailOptions = {
        to: recipientEmail,
        subject: 'Your Revia Verification Code',
        text: `Your OTP code is: ${otp}. This code will expire in 15 minutes.`,
        html: getBaseEmailTemplate(content, 'Verification Code'),
      };

      await this.sendMail(mailOptions);
      return true;
    } catch (error) {
      log.error('Error sending OTP email:', error);
      return false;
    }
  }

  // Public method to send a "device ready for pickup" notification email
  public async sendDeviceReadyForPickup(recipientEmail: string, deviceName: string): Promise<boolean> {
    try {
      const content = `
        <h2>Your Device Is Ready!</h2>
        <p>Good news! The repair for your <strong>${deviceName}</strong> has been completed and is ready for pickup.</p>

        <div class="features-list">
          <p>Next Steps:</p>
          <ul>
            <li>Visit the repair location to collect your device.</li>
            <li>Bring a valid ID for verification if requested.</li>
          </ul>
        </div>

        <p style="margin-top: 24px;">If you have any questions or need assistance, feel free to reply to this email or contact our support team.</p>
      `;

      const mailOptions: SendMailOptions = {
        to: recipientEmail,
        subject: 'Your Device Is Ready for Pickup',
        text: `Good news! The repair for your ${deviceName} has been completed and is ready for pickup.`,
        html: getBaseEmailTemplate(content, 'Device Ready for Pickup'),
      };

      await this.sendMail(mailOptions);
      return true;
    } catch (error) {
      log.error('Error sending device ready for pickup email:', error);
      return false;
    }
  }

  // Public method to send a generic repair-status-update notification email
  public async sendStatusUpdate(recipientEmail: string, deviceName: string, statusLabel: string): Promise<boolean> {
    try {
      const content = `
        <h2>Repair Status Update</h2>
        <p>The status of your repair request for <strong>${deviceName}</strong> has changed to:</p>

        <div class="otp-box">
          <p style="margin: 0; color: #1e40af; font-size: 22px; font-weight: 700;">${statusLabel}</p>
        </div>

        <p style="margin-top: 24px;">If you have any questions or need assistance, feel free to reply to this email or contact our support team.</p>
      `;

      const mailOptions: SendMailOptions = {
        to: recipientEmail,
        subject: `Repair Status Update: ${statusLabel}`,
        text: `The status of your repair request for ${deviceName} has changed to: ${statusLabel}.`,
        html: getBaseEmailTemplate(content, 'Repair Status Update'),
      };

      await this.sendMail(mailOptions);
      return true;
    } catch (error) {
      log.error('Error sending status update email:', error);
      return false;
    }
  }

  // Public method to send a periodic "care" check-in email for a completed repair.
  // Rotates between a few message variants so repeat reminders don't feel identical.
  public async sendCareCheckIn(recipientEmail: string, deviceName: string): Promise<boolean> {
    try {
      const messages = [
        {
          heading: 'How Is Your Device Doing?',
          body: `It's been a while since we repaired your <strong>${deviceName}</strong>. We just wanted to check in and make sure everything is still running smoothly.`,
        },
        {
          heading: 'We Still Care About Your Device',
          body: `Just a friendly check-in from the Revia team about your <strong>${deviceName}</strong>. If you're noticing any issues or it's due for a check-up, we're here to help.`,
        },
        {
          heading: "Thinking Of You And Your Device",
          body: `Hope your <strong>${deviceName}</strong> is treating you well! If you ever run into trouble or need another repair, Revia is just a few taps away.`,
        },
      ];
      const { heading, body } = messages[Math.floor(Math.random() * messages.length)];

      const content = `
        <h2>${heading}</h2>
        <p>${body}</p>

        <p style="margin-top: 24px;">If you have any questions or need assistance, feel free to reply to this email or contact our support team.</p>
      `;

      const mailOptions: SendMailOptions = {
        to: recipientEmail,
        subject: heading,
        text: body.replace(/<[^>]+>/g, ''),
        html: getBaseEmailTemplate(content, heading),
      };

      await this.sendMail(mailOptions);
      return true;
    } catch (error) {
      log.error('Error sending care check-in email:', error);
      return false;
    }
  }

}

// Export an instance of EmailServices with the configured sender name, email, and password
export default new EmailServices(Config.EMAIL_SENDER_NAME, Config.EMAIL_SENDER, Config.EMAIL_SENDER_PASSWORD);
