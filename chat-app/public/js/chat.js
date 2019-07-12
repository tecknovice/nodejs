const socket = io()
//Elements
const form = document.querySelector('form')
const inputText = document.querySelector('input[type="text"]')
const inputSubmit = document.querySelector('input[type="submit"]')
const button = document.querySelector('button')
const messages = document.querySelector('#messages')
//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
//Options
const { name, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
console.log({ name, room })

socket.on('message', ({ message, createdAt }) => {
    console.log({ message, createdAt })
    const html = Mustache.render(messageTemplate, { message, createdAt: moment(createdAt).format('hh:mm a') })
    messages.insertAdjacentHTML('beforeend', html)
})
socket.on('location', ({ url, createdAt }) => {
    const html = Mustache.render(locationTemplate, { url, createdAt: moment(createdAt).format('hh:mm a') })
    messages.insertAdjacentHTML('beforeend', html)
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

socket.emit('join', { name, room })