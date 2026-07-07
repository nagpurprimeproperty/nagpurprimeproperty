import Razorpay from 'razorpay';
import env from './env.js';

let razorpay;

const initRazorpay = () => {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized');
  }
  return razorpay;
};

export default initRazorpay;