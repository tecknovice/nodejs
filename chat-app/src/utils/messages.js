const generateMessage = message => {
    return {
        message,
        createdAt: new Date().getTime()
    }
}
const generateURL = url => {
    return {
        url,
        createdAt: new Date().getTime()
    }
}
module.exports = { generateMessage, generateURL }