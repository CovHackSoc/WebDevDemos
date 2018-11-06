/* eslint no-console: 0, comma-dangle: 0 */
const express = require('express');

const config = require('./config');

const app = express();
app.use(require('body-parser').json());
app.use(require('express-redis')());

/* Define our routes */
/* List all channels */
app.get('/', (req, res) => {
  req.db.keys('channel:*', (err, reply) => {
    if (err) {
      return res.send({
        error: err
      });
    }
    return res.send({
      channels: reply
    });
  });
});

app.get('/:channel/', (req, res) => {
  const redisKey = `channel:${req.params.channel}`;
  req.db.lrange(redisKey, 0, -1, (err, reply) => {
    if (err) {
      return res.send({
        channel: req.params.channel,
        messages: []
      });
    }
    return res.send({
      channel: req.params.channel,
      messages: reply
    });
  });
});

/* Add a message */
app.post('/:channel/add', (req, res) => {
  const redisKey = `channel:${req.params.channel}`;
  if (req.body.message == null) {
    return res.send({
      error: 'No Message Provided'
    });
  }

  const value = {
    channel: req.params.channel,
    author: req.body.author || 'anonymous',
    message: req.body.message
  };
  req.db.lpush(redisKey, req.body.message, (err) => {
    if (err) {
      return res.send({
        error: err
      });
    }
    return res.send(value);
  });
  return null;
});


app.listen(
  config.port,
  config.host,
  () => {
    console.log(config.host, config.port);
  },
);
