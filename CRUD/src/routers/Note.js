const express = require('express')
const router = new express.Router()
const Note = require('../models/Note')

router.post('/notes', async (req, res) => {
    const note = new Note(req.body)
    try {
        await note.save()
        res.status(201).send(note)
    } catch (error) {
        res.status(400).send(error)
    }
})
router.get('/notes', async (req, res) => {
    try {
        const notes = await Note.find({})
        res.send(notes)
    } catch (error) {
        res.status(500).send(error)
    }
})
router.get('/notes/:id', async (req, res) => {
try {
    const note = await Note.findById(req.params.id)
    if(!note) return res.status(404).send()
    res.send(note)
} catch (error) {
    res.status(500).send(error)
}
})
router.put('/notes/:id', async (req, res) => {
    const allowedFields = ['title','body']
    const fields = Object.keys(req.body)
    const isValid = fields.every(field => allowedFields.includes(field))
    if(!isValid) return res.status(400).send({'error':'Invalid fields'})
    try {
        const note = await Note.findById(req.params.id)
        if(!note) return res.status(404).send()
        fields.forEach(field => note[field] = req.body[field])
        await note.save()
        res.send(note)
    } catch (error) {
        res.status(500).send(error)
    }
})
router.delete('/notes/:id', async (req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id)
        if(!note) return res.status(404).send
        res.send(note)
    } catch (error) {
        res.status(500).send(error)
    }
})
module.exports = router

