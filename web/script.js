var socket = io('https://secure-bastion-78892.herokuapp.com/');

socket.on('wall', function (data) {
  console.log(data);

  if (data.show == 'message') {
    $('.content.message').text( data.message);
    $('body')[0].className = 'show-message'
  }

  if (data.show == 'twitter') {

    $.getJSON('https://api.twitter.com/1/statuses/oembed.json?url=' + data.message, function (response) {
      console.log(response)
    })

    $('.content.twitter').innerHTML = data.message;
    $('body').className = 'show-twitter';
  }

});
