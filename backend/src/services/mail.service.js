import initMailer from '../config/mailer.js';
import { otpTemplate } from '../templates/email/otp.template.js';
import { welcomeTemplate } from '../templates/email/welcome.template.js';
import { passwordResetTemplate } from '../templates/email/passwordReset.template.js';
const mailService = {
  // Generic send
  send: async ({ to, subject, html, text }) => {
    try {
      const transporter = initMailer();

      const info = await transporter.sendMail({
        from: `"Your App" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text,
      });

      return info;
    } catch (error) {
      console.error('Mail error:', error.message);
      throw {
        status: 500,
        message: 'Failed to send email',
      };
    }
  },

  // OTP email
  sendOtpEmail: async (to, otp) => {
    const { subject, html } = otpTemplate(otp);

    return mailService.send({
      to,
      subject,
      html,
    });
  },

  // Welcome email
  sendWelcomeEmail: async (to, name) => {
    const { subject, html } = welcomeTemplate(name);

    return mailService.send({
      to,
      subject,
      html,
    });
  },
  sendPasswordResetEmail: async (to, firstName, resetLink) => {
    const { subject, html } = passwordResetTemplate(firstName, resetLink);

    return mailService.send({
      to,
      subject,
      html,
    });
  },
};



export default mailService;