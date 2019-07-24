const express = require('express')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const User = require('../models/user')
const {sendWelcomeEmail, sendCancelationEmail} = require('../emails/account')

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    // user.save().then(() => {
    //     res.status(201).send(user)
    // }).catch((error) => {
    //     res.status(400).send(error)
    // })
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/users', auth, async (req, res) => {
    // User.find({}).then((users) => {
    //     res.send(users)
    // }).catch((error) => {
    //     res.status(500).send(error)
    // })
    try {
        const users = await User.find({})
        res.send(users)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.get('/users/:id', auth, async (req, res) => {
    const id = req.params.id
    // User.findById(id).then((user) => {
    //     if (user) res.send(user)
    //     else res.status(404).send()
    // }).catch((error) => {
    //     res.status(500).send(error)
    // })
    try {
        const user = await User.findById(id)
        if (user) res.send(user)
        else res.status(404).send()
    } catch (error) {
        res.status(500).send(error)
    }
})

// router.patch('/users/:id', auth, async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const isValidOperation = updates.every(update => allowedUpdates.includes(update))
//     if (!isValidOperation) return res.status(400).send({ 'error': 'invalid updates' })
//     try {
//         const user = await User.findById(req.params.id)
//         updates.forEach(update => user[update] = req.body[update])
//         await user.save()
//         // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
//         if (!user) return res.status(404).send()
//         res.send(user)
//     } catch (error) {
//         res.status(400).send(error)
//     }
// })

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))
    if (!isValidOperation) return res.status(400).send({ 'error': 'invalid updates' })
    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

// router.delete('/users/:id', auth, async (req, res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.params.id)
//         if (!user) return res.status(404).send()
//         res.send(user)
//     } catch (error) {
//         res.status(500).send(error)
//     }
// })

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelationEmail(req.user.email,req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        // if (!file.originalname.endsWith('.pdf')) return callback(new Error('File must be a PDF'))
        // if(!file.originalname.match(/\.(doc|docx)$/)) return callback(new Error('Please upload a Word document'))
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) return callback(new Error('Please upload your avatar'))
        callback(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) throw new Error()
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router