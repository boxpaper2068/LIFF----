require('dotenv').config();

const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc

app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  var Menu = "玉米濃湯";
  var text = "卡洛里：\n 製作時間：\n 花費："
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
 

  

  // create a echoing text message
  

  const echo = {
    "type": "template",
    "altText": "你的食譜生成了",
    "template": {
      "type": "buttons",
      "thumbnailImageUrl": "https://www.right-time.com.tw/wp-content/uploads/2023/04/OriginalTypeFoodBanner.jpeg",
      "imageAspectRatio": "rectangle",
      "imageSize": "cover",
      "imageBackgroundColor": "#FFFFFF",
      "title": Menu,
      "text": text,
      "defaultAction": {
        "type": "uri",
        "label": "View detail",
        "uri": "http://example.com/page/123"
      },
      "actions": [
        {
          "type": "uri",
          "label": "打開食譜",
          "uri": "https://charves.ddns.net/temporary"
        }
      ]
    }
  }
  
  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 1337;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
