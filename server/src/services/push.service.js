const webpush = require("web-push");

let subscribers = [];
let pushEnabled = true;

function configurePush({ subject, publicKey, privateKey }) {
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    pushEnabled = true;
  } catch (_error) {
    pushEnabled = false;
  }
}

function addSubscriber(subscription) {
  const exists = subscribers.some(sub => sub.endpoint === subscription.endpoint);
  if (!exists) {
    subscribers.push(subscription);
  }
}

function sendPush(message) {
  if (!pushEnabled) {
    return;
  }

  subscribers.forEach(async sub => {
    try {
      await webpush.sendNotification(
      sub,
      JSON.stringify({
        title: "Новый заказ!",
        body: message
      })
      );
    } catch (_error) {
      subscribers = subscribers.filter(item => item.endpoint !== sub.endpoint);
    }
  });
}

module.exports = {
  configurePush,
  addSubscriber,
  sendPush
};
