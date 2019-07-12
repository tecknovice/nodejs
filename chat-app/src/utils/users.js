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
