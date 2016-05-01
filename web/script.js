var socket = io('https://jsconfbp-walle.herokuapp.com/');

socket.on('wall', function (data) {
  console.log(data);

  $('.content').html('');

  if (data.show == 'message') {
    $('.content.message').text(data.message).fitText(1.2);
    $('body')[0].className = 'show-message'
  }

  if (data.show == 'twitter') {
    var data= JSON.parse(data.twitter)
    twttr.widgets.createTweet(
      data.url.replace(/^.*status\//,''),
      $('.content.twitter')[0],
      {
        cards: 'hidden'
      }
    )
    $('body')[0].className = 'show-twitter';
  }


  if (data.show == 'image') {
    $('.content.image').html('<img src="' + data.image + '" />');
    $('body')[0].className = 'show-image'
  }

  if (data.show == 'schedule') {
    var who = data.next.summary,
        what = data.next.description;

    $('.content.schedule').html('<h1><span><em>Up next: </em> ' + who + '</span>' + what + '</h1>');
    $('body')[0].className = 'show-schedule';
  }

});
