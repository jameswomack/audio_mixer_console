var express = require('express');
var server = express();

var MEDIA = '/media';
var PUBLIC = '/public';

server.configure(function(){
  server.use(MEDIA, express.static(__dirname + MEDIA));
  server.use(express.static(__dirname + PUBLIC));
});

server.get('/test.html', function(req, res, next){
  console.log(arguments);
  return res.json(req.query);
});

server.post('/test.html', function(req, res, next){
  var args = Array.prototype.slice.apply(arguments);
  args.forEach(function(arg){
    console.log(arg);
  });
  console.log(req.app.listeners);
  return res.json(req.params);
});


server.listen(3013);
