
var _ = require('lodash');
var ical = require('ical');

var schedule = [];



ical.fromURL("https://calendar.google.com/calendar/ical/cssconfbp.rocks_8qdn2o02kiasgaai9o2kffcl64%40group.calendar.google.com/public/basic.ics?ts=" + +new Date(), {}, function(err, data) {


for (var i in data) {
  schedule.push(data[i])
}

schedule = _.sortBy(schedule, ['start']);


  var next = _.find(schedule, function(o) {

    console.log(o.start)

    return o.start > new Date()
  });


console.log(schedule);


})
