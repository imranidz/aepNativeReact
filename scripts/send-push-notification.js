#!/usr/bin/env node

/*
 * Script to send push notifications using Expo's push notification service
 * Usage: node scripts/send-push-notification.js <expo-push-token> <title> <body>
 */

const https = require('https');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

function sendPushNotification(expoPushToken, title, body, data = {}) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  };

  const postData = JSON.stringify([message]);

  const options = {
    hostname: 'exp.host',
    port: 443,
    path: '/--/api/v2/push/send',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('Usage: node scripts/send-push-notification.js <expo-push-token> <title> <body> [data]');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/send-push-notification.js "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]" "Hello!" "This is a test notification"');
    console.log('');
    console.log('Note: You can get your Expo push token from the Push Notifications screen in your app.');
    process.exit(1);
  }

  const [expoPushToken, title, body, dataString] = args;
  let data = {};

  if (dataString) {
    try {
      data = JSON.parse(dataString);
    } catch (error) {
      console.error('Error parsing data JSON:', error.message);
      process.exit(1);
    }
  }

  try {
    console.log('Sending push notification...');
    console.log('Token:', expoPushToken);
    console.log('Title:', title);
    console.log('Body:', body);
    console.log('Data:', data);

    const response = await sendPushNotification(expoPushToken, title, body, data);
    
    console.log('Response:', JSON.stringify(response, null, 2));
    
    if (response.data && response.data[0] && response.data[0].status === 'ok') {
      console.log('✅ Push notification sent successfully!');
    } else {
      console.log('❌ Failed to send push notification');
      console.log('Error details:', response);
    }
  } catch (error) {
    console.error('❌ Error sending push notification:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { sendPushNotification }; 