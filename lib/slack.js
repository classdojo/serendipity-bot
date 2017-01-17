const Slack    = require("@slack/client");

module.exports = function postToSlack (token, channel, message) {
  try {
    const slackClient = new Slack.WebClient(token);
    slackClient.chat.postMessage(channel, message, {as_user: true, link_names: true})
      .catch((err) => {
        err.message = `Could not post to Slack: ${err.message}`;
        throw err;
      });
  } catch (err) {
    err.message = `Could not connect to Slack: ${err.message}`;
    throw err;
  }
}
