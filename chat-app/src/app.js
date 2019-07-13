const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateURL } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

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
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room })
        if (error) return callback(error)
        socket.join(user.room)
        socket.emit('message', generateMessage('Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.name} has joined`))
        io.to(user.room).emit('room', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('message', (message, callback) => {
        const { id, name, room } = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)) return callback('Profanity is not allow')
        io.to(room).emit('message', generateMessage(message, name))
        callback()
    })
    socket.on('location', (location, callback) => {
        const { id, name, room } = getUser(socket.id)
        io.to(room).emit('location', generateURL(`https://google.com/maps?q=${location.latitude},${location.longitude}`, name))
        callback()
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('room', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            io.to(user.room).emit('message', generateMessage(`${user.name} has left`))
        }
    })
})