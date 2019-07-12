const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateURL } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicFolder = path.join(__dirname, '../public')
app.use(express.static(publicFolder))
server.listen(port)
io.on('connection', (socket) => {

    // socket.emit('message', generateMessage('Welcome'))
    // socket.broadcast.emit('message', generateMessage('A new user has joined'))
    socket.on('join', ({ name, room }) => {
        socket.join(room)
        socket.emit('message', generateMessage('Welcome'))
        socket.broadcast.to(room).emit('message', generateMessage(`${name} has joined`))
    })

    socket.on('message', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) return callback('Profanity is not allow')
        io.emit('message', generateMessage(message))
        callback()
    })
    socket.on('location', (location, callback) => {
        io.emit('location', generateURL(`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })
    socket.on('disconnect', () => io.emit('message', generateMessage('A user has left')))
})