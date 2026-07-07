export const otpTemplate = (otp) => ({
  subject: 'Your OTP Code',
  html: `
    <h3>OTP Verification</h3>
    <p>Your OTP is: <b>${otp}</b></p>
    <p>This will expire in 5 minutes.</p>
  `,
});