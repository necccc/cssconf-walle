var port = process.env.PORT || 8080;
var request = require('request');
var Botkit = require('botkit');
var Server = require('socket.io');
var redis = require("redis"),
    redisClient = redis.createClient({
      host: 'ec2-54-83-204-56.compute-1.amazonaws.com',
      port: 13299,
      password: process.env.WALLE_REDIS_PW
    });

var io = new Server(port);

io.on('connection', function(socket){

  redisClient.hgetall("wall", function(err, obj) {
    io.emit('wall', obj);
  })

});

var controller = Botkit.slackbot();
var bot = controller.spawn({
  token: process.env.WALLE_BOT_TOKEN
})

bot.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
});

controller.hears(["help"],["direct_message","direct_mention"],function(bot,message) {
  // do something to respond to message
  // all of the fields available in a normal Slack message object are available
  // https://api.slack.com/events/message
  console.log(message)
  bot.reply(message,
    "Hi! Allow me to control your conf wall with these messages: \n\t" +
    " - `default` resume to normal schedule display \n\t" +
    " - `say` send a message to the wall \n\t" +
    " - `img` send an image url to the wall \n\t" +
    " - `twit` embed a tweet url to the wall"
  );
});

controller.hears(["default"],["direct_message","direct_mention"],function(bot,message) {
  console.log(message)

  redisClient.hset("wall", "show", "shedule");

  redisClient.hgetall("wall", function(err, obj) {
    io.emit('wall', obj);
  })


  bot.reply(message, 'Showing normal schedule');

});

controller.hears(["say"],["direct_message","direct_mention"],function(bot,message) {
  console.log(message)

  var msg = message.text.replace(/^say /i, '');

  redisClient.hset("wall", "show", "message");
  redisClient.hset("wall", "message", msg);
  bot.reply(message, "Now showing message \n > " + msg);
  redisClient.hgetall("wall", function(err, obj) {
    io.emit('wall', obj);
  })

});

controller.hears(["img"],["direct_message","direct_mention"],function(bot,message) {
  console.log(message)
  var img = message.text.replace(/^img /i, '')
  redisClient.hset("wall", "show", "image");
  redisClient.hset("wall", "image", img);
  bot.reply(message, "Now showing image \n " + img);
  redisClient.hgetall("wall", function(err, obj) {
    io.emit('wall', obj);
  })

});

controller.hears(["twit"],["direct_message","direct_mention"],function(bot,message) {
  console.log(message)
  var twit = message.text.replace(/^twit /i, '').replace(/[<>]/g,'')


  request('https://api.twitter.com/1/statuses/oembed.json?url=' + twit, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      redisClient.hset("wall", "show", "twitter");
      redisClient.hset("wall", "twitter", body);
      bot.reply(message, "Now embedding twit \n " + twit);

      redisClient.hgetall("wall", function(err, obj) {
        io.emit('wall', obj);
      })
    }

    if (error) {
      console.log(error)
    }
  });

});
