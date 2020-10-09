const mailjet = require('node-mailjet')
    .connect('2cd0520356263e3ebde68e4c5931cc2d', '1cb443d26fcfd373e5480e9b7dcc5bc1')
const request = mailjet
    .post("send", { 'version': 'v3.1' })
    .request({
        "Messages": [
            {
                "From": {
                    "Email": "tecknovice@gmail.com",
                    "Name": "Hung"
                },
                "To": [
                    {
                        "Email": "tecknovice@gmail.com",
                        "Name": "Hung"
                    }
                ],
                "Subject": "Greetings from Mailjet.",
                "TextPart": "My first Mailjet email",
                "HTMLPart": "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
                "CustomID": "AppGettingStartedTest"
            }
        ]
    })
request
    .then((result) => {
        console.log(result.body)
    })
    .catch((err) => {
        console.log(err)
    })