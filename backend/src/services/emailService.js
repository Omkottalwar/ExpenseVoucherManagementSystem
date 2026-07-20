const nodemailer = require('nodemailer');

const getEmailHtml = (email, name, password, role) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #0d6efd, #0d6efd); padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">ExpenseVoucher Management</h1>
        <p style="margin: 4px 0 0 0; opacity: 0.8; font-size: 14px;">Welcome to your new company portal account</p>
      </div>
      
      <div style="padding: 24px; background-color: #ffffff;">
        <p style="margin-top: 0; font-size: 16px;">Hello <strong>${name}</strong>,</p>
        <p>An administrator has created your new account on the <strong>ExpenseVoucher Management System</strong>.</p>
        <p>You can sign in to your workspace using the following credentials:</p>
        
        <div style="background-color: #f8f9fa; border-left: 4px solid #0d6efd; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #495057; width: 100px;">Portal Link:</td>
              <td style="padding: 6px 0; color: #212529;"><a href="http://localhost:5173/login" style="color: #0d6efd; text-decoration: none; font-weight: 600;">Sign In Here</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #495057;">Email:</td>
              <td style="padding: 6px 0; color: #212529;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #495057;">Password:</td>
              <td style="padding: 6px 0; color: #212529;"><code style="font-family: monospace; font-size: 14px; background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-weight: bold; color: #d63384;">${password}</code></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #495057;">Assigned Role:</td>
              <td style="padding: 6px 0; color: #212529;"><span style="background-color: #e2e3e5; color: #41464b; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">${role}</span></td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 14px; color: #6c757d;">For security, we highly recommend changing your password after your first successful sign-in.</p>
        
        <div style="text-align: center; margin-top: 30px; margin-bottom: 10px;">
          <a href="http://localhost:5173/login" style="background-color: #0d6efd; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 2px 4px rgba(13,110,253,0.2);">
            Access Portal
          </a>
        </div>
      </div>
      
      <div style="background-color: #f1f3f5; padding: 16px; text-align: center; border-top: 1px solid #e9ecef; font-size: 12px; color: #868e96;">
        <p style="margin: 0;">This is an automated system notification. If you did not expect this account, please contact system administration.</p>
      </div>
    </div>
  `;
};

const sendCredentialsEmail = async (email, name, password, role) => {
  // If SMTP configs are specified in the env, prefer SMTP (Nodemailer)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const htmlContent = getEmailHtml(email, name, password, role);

      const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL || `ExpenseVoucher <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your ExpenseVoucher Credentials',
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully via SMTP:', info.messageId);
      return { success: true, data: info };
    } catch (error) {
      console.error('Failed to send credentials email via SMTP (Nodemailer). Attempting Resend API fallback:', error);
    }
  }

  // Fallback to Resend HTTP API
  console.log('Attempting delivery via Resend API.');
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('Resend API key is not configured in environment variables.');
    return { success: false, error: 'Email service configuration error: Resend API key missing.' };
  }
  const url = 'https://api.resend.com/emails';
  const htmlContent = getEmailHtml(email, name, password, role);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'ExpenseVoucher <onboarding@resend.dev>',
        to: email,
        subject: 'Your ExpenseVoucher Credentials',
        html: htmlContent,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Resend API error response:', data);
      return { success: false, error: data.message || 'Failed to send credentials email via Resend' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send credentials email via Resend:', error);
    return { success: false, error: error.message };
  }
};

const sendResetPasswordEmail = async (email, name, resetUrl, portal = 'Employee') => {
  // Overriding recipient email to omkottalwar17@gmail.com for testing purposes since it is the only registered Resend email address
  const recipientEmail = 'omkottalwar17@gmail.com';

  const getResetHtml = () => {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #e06666, #cc0000); padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">ExpenseVoucher Security</h1>
          <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Password Reset Request (${portal} Portal)</p>
        </div>
        
        <div style="padding: 24px; background-color: #ffffff;">
          <p style="margin-top: 0; font-size: 16px;">Hello <strong>${name}</strong>,</p>
          <p>We received a request from the <strong>${portal} Portal</strong> to reset the password for your ExpenseVoucher account associated with <strong>${email}</strong>.</p>
          <p>Click the button below to choose a new password. This link is only valid for <strong>10 minutes</strong>.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #cc0000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 2px 4px rgba(204,0,0,0.2);">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 13px; color: #6c757d;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 13px; background-color: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all; border: 1px solid #eee;">
            <a href="${resetUrl}" style="color: #0d6efd;">${resetUrl}</a>
          </p>
          
          <p style="font-size: 14px; color: #6c757d; margin-top: 25px;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        
        <div style="background-color: #f1f3f5; padding: 16px; text-align: center; border-top: 1px solid #e9ecef; font-size: 12px; color: #868e96;">
          <p style="margin: 0;">This is a secure automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    `;
  };

  // If SMTP configs are specified, prefer SMTP (Nodemailer)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const htmlContent = getResetHtml();

      const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL || `ExpenseVoucher <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: `Reset your ExpenseVoucher Password [${portal} Portal]`,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Reset email sent successfully via SMTP:', info.messageId);
      return { success: true, data: info };
    } catch (error) {
      console.error('Failed to send reset email via SMTP (Nodemailer). Attempting Resend API fallback:', error);
    }
  }

  // Fallback to Resend API
  console.log('Attempting reset email delivery via Resend API.');
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('Resend API key is not configured in environment variables.');
    return { success: false, error: 'Email service configuration error: Resend API key missing.' };
  }
  const url = 'https://api.resend.com/emails';
  const htmlContent = getResetHtml();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'ExpenseVoucher <onboarding@resend.dev>',
        to: recipientEmail,
        subject: `Reset your ExpenseVoucher Password [${portal} Portal]`,
        html: htmlContent,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Resend API reset error response:', data);
      return { success: false, error: data.message || 'Failed to send reset email via Resend' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send reset email via Resend:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendCredentialsEmail, sendResetPasswordEmail };
