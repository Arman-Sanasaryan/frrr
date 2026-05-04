const webpush = require("web-push");

let subscribers = [];

function configurePush({ subject, publicKey, privateKey }) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

function addSubscriber(subscription) {
  subscribers.push(subscription);
}

function sendPush(message) {
  subscribers.forEach(sub => {
    webpush.sendNotification(
      sub,
      JSON.stringify({
        title: "Новый заказ!",
        body: message
      })
    );
  });
}

module.exports = {
  configurePush,
  addSubscriber,
  sendPush
};
