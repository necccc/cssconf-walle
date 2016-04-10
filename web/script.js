var socket = io('https://secure-bastion-78892.herokuapp.com/');

socket.on('wall', function (data) {
  console.log(data);

  $('.content.twitter').html('')

  if (data.show == 'message') {
    $('.content.message').text( data.message);
    $('body')[0].className = 'show-message'
  }

  if (data.show == 'twitter') {
    $('.content.twitter').html('')
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

});
