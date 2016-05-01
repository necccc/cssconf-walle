var port = process.env.PORT || 8080;
var request = require('request');
var _ = require('lodash');
var Botkit = require('botkit');
var ical = require('ical');
var Server = require('socket.io');
var redis = require("redis"),
    redisClient = redis.createClient({
      host: process.env.WALLE_REDIS_HOST,
      port: process.env.WALLE_REDIS_PORT,
      password: process.env.WALLE_REDIS_PW
    });
var controller = Botkit.slackbot();
var io = new Server(port);

var schedule = [];

ical.fromURL(process.env.WALLE_ICAL_URL, {}, function(err, data) {


  for (var i in data) {
    schedule.push(data[i])
  }

  schedule = _.sortBy(schedule, ['start'])



/**

'tntgpvumh7a8pue94ie8d55kpo@google.com':
  { type: 'VEVENT',
    params: [],
    start: { Mon, 11 Apr 2016 14:30:00 GMT tz: undefined },
    end: { Mon, 11 Apr 2016 15:00:00 GMT tz: undefined },
    dtstamp: '20160411T112215Z',
    uid: 'tntgpvumh7a8pue94ie8d55kpo@google.com',
    created: '20160410T154301Z',
    description: 'The Formulartic Spectrum',
    'last-modified': '20160410T154342Z',
    location: '',
    sequence: '1',
    status: 'CONFIRMED',
    summary: 'Suz Hinton',
    transparency: 'OPAQUE' },
 'qkvrj1q9ntbonjo8rvukk7uf54@google.com':
  { type: 'VEVENT',
    params: [],
    start: { Mon, 11 Apr 2016 14:00:00 GMT tz: undefined },
    end: { Mon, 11 Apr 2016 14:30:00 GMT tz: undefined },
    dtstamp: '20160411T112215Z',
    uid: 'qkvrj1q9ntbonjo8rvukk7uf54@google.com',
    created: '20160410T153802Z',
    description: 'High Performance in the Critical Rendering Path',
    'last-modified': '20160410T154322Z',
    location: '',
    sequence: '1',
    status: 'CONFIRMED',
    summary: 'Nicolás Bevacqua',
    transparency: 'OPAQUE' } }

*/





  io.on('connection', function(socket){
    redisClient.hgetall("wall", function(err, obj) {

       if (err) throw err;
       
       if (!obj) {
          redisClient.hset("wall", "message", "Hi Dave");
          redisClient.hset("wall", "show", "message");
          obj = {
            message: "Hi Dave",
            show: "message"
          }
       }
      
      var next = _.find(schedule, function(o) {
        return o.start > new Date()
      });

      obj.next = next;
      io.emit('wall', obj);
    })
  });


  var bot = controller.spawn({
    token: process.env.WALLE_BOT_TOKEN
  })

  bot.startRTM(function(err,bot,payload) {
    if (err) {
      throw new Error('Could not connect to Slack');
    }
  });


})




controller.hears(["help"],["direct_message","direct_mention"],function(bot,message) {
  bot.reply(message,
    "Hi! Allow me to control your conf wall with these messages: \n\t" +
    " - `default` resume to normal schedule display \n\t" +
    " - `say` send a message to the wall \n\t" +
    " - `img` send an image url to the wall \n\t" +
    " - `twit` embed a tweet url to the wall"
  );
});

controller.hears(["default"],["direct_message","direct_mention"],function(bot,message) {
  // todo
  redisClient.hset("wall", "show", "schedule");
  redisClient.hgetall("wall", function(err, obj) {
    var next = _.find(schedule, function(o) {
      return o.start > new Date()
    });

    obj.next = next;
    io.emit('wall', obj);
  })
  bot.reply(message, 'Showing normal schedule');
});

controller.hears(["say"],["direct_message","direct_mention"],function(bot,message) {
  var msg = message.text.replace(/^say /i, '');
  redisClient.hset("wall", "show", "message");
  redisClient.hset("wall", "message", msg);
  bot.reply(message, "Now showing message \n > " + msg);
  redisClient.hgetall("wall", function(err, obj) {
    io.emit('wall', obj);
  })
});

controller.hears(["img"],["direct_message","direct_mention"],function(bot,message) {
  var img = message.text.replace(/^img /i, '').replace(/[<>]/g,'');
  redisClient.hset("wall", "show", "image");
  redisClient.hset("wall", "image", img);
  bot.reply(message, "Now showing image \n " + img);
  redisClient.hgetall("wall", function(err, obj) {
    io.emit('wall', obj);
  })
});

controller.hears(["twit"],["direct_message","direct_mention"],function(bot,message) {
  var twit = message.text.replace(/^twit /i, '').replace(/[<>]/g,'')
  request('https://api.twitter.com/1/statuses/oembed.json?omit_script=true&url=' + twit, function (error, response, body) {
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
