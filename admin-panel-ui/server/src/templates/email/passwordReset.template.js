export const passwordResetTemplate = (firstName, resetLink) => ({
  subject: 'Reset Your Password - NagpurProperty',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hi ${firstName},</p>
      <p>You requested a password reset. Click the button below to set a new password.</p>
      <p>This link expires in <strong>20 minutes</strong>.</p>
      <a href="${resetLink}"
         style="display:inline-block;padding:12px 24px;background:#f97316;color:#fff;
                text-decoration:none;border-radius:6px;margin:16px 0;">
        Reset Password
      </a>
      <p>If the button doesn't work, copy this link:<br/>
        <a href="${resetLink}">${resetLink}</a>
      </p>
      <p>If you did not request this, ignore this email.</p>
    </div>
  `,
});