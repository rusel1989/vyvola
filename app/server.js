var path = require('path')
var express = require('express')();
var http = require('http').Server(express);
var io = require('socket.io')(http);
var fs = require('fs')
var db = require('./storage')

var electronAppPath = process.env.NODE_ENV === 'production' ? require('electron').app.getAppPath() + '/dist/' : __dirname

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('sync_board_request', () => {
    console.log('sync board req')
    socket.broadcast.emit('sync_board_request')
  })

  socket.on('sync_board_response', (data) => {
    console.log('sync board res')
    db.find({ key: {$ne: 'settings' }}, (err, docs) => {
      if (err) {
        console.log('find err', err)
        socket.broadcast.emit('sync_board_response', data)
        return
      }
      socket.broadcast.emit('sync_board_response', docs)
    })
  })

  socket.on('set_show_status', (data) => {
    console.log('set show status', data)
    data.key = 'settings'
    db.update({ key: 'settings' }, data, { upsert: true }, (err) => {
      if (err) {
        console.log('update settigns err', err)
      }
      socket.broadcast.emit('set_show_status', data)    })
  })

  socket.on('add_number', (item) => {
    db.insert(item, (err) => {
      if (err) {
        console.log('insert err', err)
      }
      socket.broadcast.emit('number_added', item)
    })
  })


  socket.on('update_number', (item) => {
    db.update({ number: item.number }, item, {}, (err) => {
      if (err) {
        console.log('update err', err)
      }
      socket.broadcast.emit('number_updated', item)
    })
  })

  socket.on('remove_number', (item) => {
    db.remove({ number: item.number }, {}, (err) => {
      if (err) {
        console.log('remove err', err)
      }
      socket.broadcast.emit('number_removed', item)
    })
  })

  socket.on('ring_number', (item) => {
    socket.broadcast.emit('number_ringed', item)
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
