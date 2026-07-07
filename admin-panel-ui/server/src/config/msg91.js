import msg91 from 'msg91';
import env from './env.js';

let smsClient;

const initMSG91 = () => {
  if (!smsClient) {
    smsClient = msg91(env.MSG91_AUTH_KEY);
    console.log('MSG91 initialized');
  }
  return smsClient;
};

export default initMSG91;