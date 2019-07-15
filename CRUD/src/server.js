const express = require('express')
require('./db/mongoose')
const noteRouter = require('./routers/Note')

const server = express()

server.use(express.json())
server.use(noteRouter)

const PORT = process.env.PORT
server.listen(PORT, () => console.log(`Server is up on port ${PORT}`))