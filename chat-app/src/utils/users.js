const users = []

const addUser = ({ id, name, room }) => {
    //clean data
    name = name.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate
    if (!name || !room) return {
        error: 'Name and Room are required'
    }

    //check for existing user
    const existingUser = users.find(user => user.name === name && user.room === room)

    //validate user
    if (existingUser) return { error: 'Name is in use' }

    //Store user
    const user = { id, name, room }
    users.push(user)
    return { user }
}

const removeUser = id => {
    const index = users.findIndex(user => user.id === id)
    if (index !== -1) return users.splice(index, 1)[0]
}

const getUser = id => users.find(user => user.id === id)

const getUsersInRoom = room => {
    room = room.trim().toLowerCase()
    return users.filter(user => user.room === room)
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom }

