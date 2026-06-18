import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set SendGrid API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Send OTP Email endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, otp, type } = req.body;

    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // If SendGrid API key is not set, return a demo message
    if (!process.env.SENDGRID_API_KEY) {
      console.log(`[DEMO MODE] OTP ${type}: Sending OTP ${otp} to ${email}`);
      return res.json({
        success: true,
        message: `[DEMO MODE] OTP sent to ${email}. Check browser console for OTP.`,
        demo: true,
        otp: otp // Only for demo/testing
      });
    }

    // Prepare email content
    const emailSubject = type === 'reset' 
      ? 'Reset Your Password - Solo Leveling'
      : 'Verify Your Email - Solo Leveling';

    const emailContent = type === 'reset'
      ? `<h2>Password Reset Request</h2>
         <p>Your OTP for password reset is:</p>
         <h3 style="color: #ef4444; font-size: 24px; letter-spacing: 4px; font-family: monospace;">${otp}</h3>
         <p>This OTP will expire in 10 minutes.</p>
         <p>If you didn't request this, please ignore this email.</p>`
      : `<h2>Email Verification</h2>
         <p>Welcome to Solo Leveling! Your email verification OTP is:</p>
         <h3 style="color: #ef4444; font-size: 24px; letter-spacing: 4px; font-family: monospace;">${otp}</h3>
         <p>This OTP will expire in 10 minutes.</p>`;

    // Send email via SendGrid
    const message = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@sololeveling.com',
      subject: emailSubject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(to bottom, #0f051d, #07010f); color: #c084fc; padding: 20px; border-radius: 10px; }
              .content { padding: 20px; }
              .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; text-align: center;">Solo Leveling</h1>
              </div>
              <div class="content">
                ${emailContent}
              </div>
              <div class="footer">
                <p>© 2024 Solo Leveling. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await sgMail.send(message);

    res.json({
      success: true,
      message: `OTP sent to ${email}`
    });
  } catch (error) {
    console.error('SendGrid Error:', error);
    res.status(500).json({
      error: 'Failed to send OTP',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Solo Leveling Server running on http://localhost:${PORT}`);
  console.log(`📧 SendGrid API Key: ${process.env.SENDGRID_API_KEY ? '✅ Configured' : '❌ Not set (Demo mode)'}`);
});
