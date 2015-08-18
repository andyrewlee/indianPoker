var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, './static')));
app.use(bodyParser.urlencoded());
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 5000));

app.get('/', function(req, res) {
 res.render('index');
});

var server = app.listen(app.get('port'), function() {
  console.log('listening on port', app.get('port'));
});

var io = require('socket.io').listen(server);

var suits = ["Spade", "Diamond", "Heart", "Clover"];
var numbers = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createDeck() {
  var cards = [];

  for(var i = 0; i < suits.length; i++) {
    for(var j = 0; j < numbers.length; j++) {
      cards.push([suits[i], numbers[j]]);
    }
  }

  return cards;
}

var deck = createDeck();

var rooms = {};

io.sockets.on('connection', function (socket) {
  console.log('SERVER::WE ARE USING SOCKETS!');
  console.log(socket.id);

  socket.on("joinRoom", function(data) {
    socket.join(data);
  });

  socket.on("getCard", function(data) {
    if(rooms[data] == undefined) {
      rooms[data] = [];
    }

    var randomCard = deck[Math.floor(Math.random() * deck.length - 1)];

    console.log(randomCard);

    while(rooms[data].indexOf(randomCard) != -1) {
      randomCard = deck[Math.floor(Math.random() * deck.length - 1)];
    }

    rooms[data].push(randomCard);
    console.log("WHAT");
    console.log(randomCard);

    io.to(data).emit('dealCard', {suit: randomCard[0], number: randomCard[1]});
  });


  socket.on("newGame", function(data) {
    if(rooms[data] == undefined) {
      rooms[data] = [];
    }

    if(rooms[data].length >= 51) {
      rooms[data] = [];
    }

    var randomCard = deck[Math.floor(Math.random()*53)];

    console.log(randomCard);

    while(rooms[data].indexOf(randomCard) != -1 || randomCard == undefined) {
      randomCard = deck[Math.floor(Math.random() * deck.length - 1)];
    }

    rooms[data].push(randomCard);
    console.log("WHAT");
    console.log(randomCard);
    console.log(rooms[data]);
    console.log(rooms[data].length);
    socket.emit('dealCard', {suit: randomCard[0], number: randomCard[1]});
  });

  socket.on("shuffle", function(data) {
    console.log(rooms[data]);
    rooms[data] = [];
    console.log(rooms[data]);
  });

  socket.on("leave", function(data) {
    socket.leave(data);
  });
});
