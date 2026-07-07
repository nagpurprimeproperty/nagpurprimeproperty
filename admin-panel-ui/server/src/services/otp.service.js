import initMSG91 from '../config/msg91.js';
import env from '../config/env.js';

export const sendOTP = async (mobile, otp) => {
  try {
    const client = initMSG91();

    const response = await client.send({
      flow_id: env.MSG91_TEMPLATE_ID, // DLT template ID
      mobiles: `91${mobile}`, // India country code
      OTP: otp, // variable name must match template
    });

    return response;
  } catch (error) {
    console.error('MSG91 send error:', error.message);
    throw {
      status: 500,
      message: 'Failed to send SMS',
    };
  }
};