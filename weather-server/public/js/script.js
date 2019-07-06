const search = (address, callback) => {
    fetch(`/weather?address=${address}`).then((response) => {
        response.json().then((data) => {
            if (data.error) {
                callback(data.error)
            }
            else {
                callback(null, data)
            }
        })
    })
}
const mainContent = document.querySelector('.main-content')
const weatherForm = document.getElementsByTagName('form')[0]
const input = document.querySelector('input')
const result = document.querySelector('#result')
weatherForm.addEventListener('submit', (event) => {
    //prevent default form behavior (which is auto refresh page)
    event.preventDefault()
    const address = input.value
    result.innerText = 'Searching ...'
    search(address, (error, { place, forecast } = {}) => {
        if (error) {
            result.innerText = `Error: ${error}`
        } else {
            result.innerHTML = `
                <div>Place: ${place}</div>
                <div>Forecast: ${forecast}</div>
            `
        }
    })
})