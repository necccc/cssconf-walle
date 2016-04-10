var socket = io('https://secure-bastion-78892.herokuapp.com/');

socket.on('wall', function (data) {
  console.log(data);

  if (data.show == 'message') {
    $('.content.message').text( data.message);
    $('body')[0].className = 'show-message'
  }

  if (data.show == 'twitter') {




    $('.content.twitter').html()// = data.twitter;
    $('body').className = 'show-twitter';
  }

});
