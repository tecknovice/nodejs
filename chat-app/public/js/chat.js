const socket = io()
//Elements
const form = document.querySelector('form')
const inputText = document.querySelector('input[type="text"]')
const inputSubmit = document.querySelector('input[type="submit"]')
const button = document.querySelector('button')
const messages = document.querySelector('#messages')
const aside = document.querySelector('aside')
//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const asideTemplate = document.querySelector('#aside-template').innerHTML
//Options
const { name, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const dm = () =>{
    //new mesg element
    const newMesg = messages.lastElementChild
    //Height of the last mesg
    const newMesgStyle = getComputedStyle(newMesg)
    const newMesgMargin = parseInt(newMesgStyle.marginBottom)
    const newMesgHeight = newMesg.offsetHeight + newMesgMargin
    console.log(newMesgHeight);
    //visible height
    const visibleHeight = messages.offsetHeight
    //height of messages container
    const containerHeight = messages.scrollHeight
    //how far have I scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if(containerHeight - newMesgHeight <=scrollOffset){
        messages.scrollTop=messages.scrollHeight
    }
}

const autoScroll = () => {
    // New message element
    const newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('message', ({ name, message, createdAt }) => {
    const html = Mustache.render(messageTemplate, { name, message, createdAt: moment(createdAt).format('hh:mm a') })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})
socket.on('location', ({ name, url, createdAt }) => {
    const html = Mustache.render(locationTemplate, { name, url, createdAt: moment(createdAt).format('hh:mm a') })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})
socket.on('room', ({ room, users }) => {
    const html = Mustache.render(asideTemplate, { room, users })
    aside.innerHTML = html
})

form.addEventListener('submit', event => {
    event.preventDefault()
    inputSubmit.setAttribute('disabled', 'disabled')
    let message = inputText.value
    socket.emit('message', message, error => {
        inputText.value = ''
        inputText.focus()
        inputSubmit.removeAttribute('disabled')
        if (error) console.log(error)
        else console.log('Message delivered')
    })
})
button.addEventListener('click', () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported')
    button.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition(({ coords }) =>
        socket.emit(
            'location',
            {
                longitude: coords.longitude,
                latitude: coords.latitude
            },
            error => {
                if (error) console.log(error)
                else {
                    button.removeAttribute('disabled')
                    console.log('Location shared')
                }
            }
        )
    )
})

socket.emit('join', { name, room }, error => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})