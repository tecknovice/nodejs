const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_APIKEY)
const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from: 'tecknovice@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancelationEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from: 'tecknovice@gmail.com',
        subject: 'Sorry for your inconvenience!',
        text: `Hello, ${name}. We 've known that you had canceled your account on Task App. Please let us know what problem is going on.`
    })
}

module.exports = {sendWelcomeEmail, sendCancelationEmail}