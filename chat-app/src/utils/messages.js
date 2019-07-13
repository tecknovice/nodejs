const generateMessage = (message, name = 'System') => {
    return {
        name,
        message,
        createdAt: new Date().getTime()
    }
}
const generateURL = (url, name = 'System') => {
    return {
        name,
        url,
        createdAt: new Date().getTime()
    }
}
module.exports = { generateMessage, generateURL }