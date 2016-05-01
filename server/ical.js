
var _ = require('lodash');
var ical = require('ical');

var schedule = [];



ical.fromURL("https://calendar.google.com/calendar/ical/jsconfbp.com_vrsdi6khdno18i04vkjcum3id4%40group.calendar.google.com/public/basic.ics?ts=" + +new Date(), {}, function(err, data) {


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
