var path = require('path')
var express = require('express')();
var http = require('http').Server(express);
var io = require('socket.io')(http);
var fs = require('fs')

var electronAppPath = process.env.NODE_ENV === 'production' ? require('electron').app.getAppPath() + '/dist/' : __dirname

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('add_number', (number) => {
    socket.broadcast.emit('number_added', number)
  })

  socket.on('sync_board_request', () => {
    console.log('sync board req')
    socket.broadcast.emit('sync_board_request')
  })

  socket.on('sync_board_response', (data) => {
    console.log('sync board res')
    socket.broadcast.emit('sync_board_response', data)
  })

  socket.on('update_number', (number) => {
    socket.broadcast.emit('number_updated', number)
  })

  socket.on('ring_number', (number) => {
    socket.broadcast.emit('number_ringed', number)
  })

  socket.on('remove_number', (number) => {
    socket.broadcast.emit('number_removed', number)
  })
})

express.get('/info', function(req, res){
  const dirContents = fs.readdirSync(electronAppPath)
  res.send(JSON.stringify({ dirContents }))
})

express.get('/', function(req, res){
  res.sendFile(path.join(electronAppPath, 'board.html'))
})

express.get('/ding', function(req, res){
  res.sendFile('/vyvolavac/bell.mp3');
})

express.get('/socket-io-client.js', function(req, res){
  res.sendFile(path.join(electronAppPath, 'socket.io.min.js'))
})

exports.startServer= () => {
  console.log('start server')
  http.listen(8000, function () {
    console.log('listening on *:8000')
  })
}

exports.stopServer = () => {
  console.log('stop server')
  http.close()
}
