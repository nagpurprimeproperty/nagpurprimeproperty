import initFirebase from '../config/firebase.js';

const pushService = {
  // Send to single device
  sendToDevice: async ({ token, title, body, data = {} }) => {
    try {
      const app = initFirebase();
      const messaging = app.messaging();

      const message = {
        token,
        notification: {
          title,
          body,
        },
        data: Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]); // FCM requires string values
          return acc;
        }, {}),
      };

      const response = await messaging.send(message);

      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      console.error('Push error:', error.message);
      throw {
        status: 500,
        message: 'Failed to send push notification',
      };
    }
  },

  // Send to multiple devices
  sendToMultiple: async ({ tokens, title, body, data = {} }) => {
    try {
      const app = initFirebase();
      const messaging = app.messaging();

      const message = {
        tokens,
        notification: { title, body },
        data: Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {}),
      };

      const response = await messaging.sendMulticast(message);

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error('Push multicast error:', error.message);
      throw {
        status: 500,
        message: 'Failed to send push notifications',
      };
    }
  },

  // Send to topic (best for broadcast)
  sendToTopic: async ({ topic, title, body, data = {} }) => {
    try {
      const app = initFirebase();
      const messaging = app.messaging();

      const message = {
        topic,
        notification: { title, body },
        data: Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {}),
      };

      const response = await messaging.send(message);

      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      console.error('Push topic error:', error.message);
      throw {
        status: 500,
        message: 'Failed to send topic notification',
      };
    }
  },
};

export default pushService;