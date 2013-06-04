var express = require('express');
var server = express();

var MEDIA = '/media';
var PUBLIC = '/public';

server.configure(function(){
  server.use(MEDIA, express.static(__dirname + MEDIA));
  server.use(express.static(__dirname + PUBLIC));
});

server.listen(3013);
