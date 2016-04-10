var socket = io('https://secure-bastion-78892.herokuapp.com/');

socket.on('wall', function (data) {
  console.log(data);

  if (data.show == 'message') {
    document.querySelector('.content.message').innerHTML = data.message;
    document.querySelector('body').className = 'show-message';
  }
});
